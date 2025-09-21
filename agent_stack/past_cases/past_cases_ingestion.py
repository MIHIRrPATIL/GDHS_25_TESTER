import requests
import xml.etree.ElementTree as ET
import re
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
import time
import json

# ----------------------------
# CONFIG
# ----------------------------
NCBI_API_KEY = "5a2a725a802943bde4b1543f85d20e54c608"
PUBMED_BATCH_SIZE = 200  # number of PMIDs per efetch request (max ~200-300)
PUBMED_MAX_RESULTS = 500  # max number of articles to fetch
CHUNK_SIZE = 500  # words per text chunk
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Initialize embedding model
embedder = SentenceTransformer(EMBEDDING_MODEL)

# ----------------------------
# HELPER FUNCTIONS
# ----------------------------

def rate_limited_get(url, params, delay=0.15):
    """GET request with delay to avoid hitting rate limits (~10 requests/sec)."""
    response = requests.get(url, params=params)
    time.sleep(delay)
    return response

# --------- PubMed fetching ---------

def fetch_pubmed_pmids(query, retmax=PUBMED_MAX_RESULTS):
    """Search PubMed for PMIDs."""
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": retmax,
        "usehistory": "y",
        "api_key": NCBI_API_KEY,
        "retmode": "json"
    }
    resp = rate_limited_get(url, params)
    data = resp.json()
    count = int(data['esearchresult']['count'])
    webenv = data['esearchresult']['webenv']
    query_key = data['esearchresult']['querykey']
    pmid_list = data['esearchresult']['idlist']
    return pmid_list, webenv, query_key, count

def fetch_pubmed_abstracts_batch(webenv, query_key, batch_size=PUBMED_BATCH_SIZE):
    """Fetch all abstracts using Entrez History in batches with tqdm progress."""
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    start = 0
    all_articles = []

    # First, estimate total number of records
    # We'll get the total from esearch count
    total_records_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    params_count = {
        "db": "pubmed",
        "query_key": query_key,
        "WebEnv": webenv,
        "api_key": NCBI_API_KEY,
        "retmode": "json"
    }
    resp_count = rate_limited_get(total_records_url, params_count)
    try:
        total = int(resp_count.json()['result']['uids'][0])
    except:
        total = 500  # fallback
    if total < batch_size:
        total = batch_size

    # Use tqdm to track batch fetching
    pbar = tqdm(desc="Fetching PubMed batches", unit="batch")
    while True:
        params = {
            "db": "pubmed",
            "query_key": query_key,
            "WebEnv": webenv,
            "retstart": start,
            "retmax": batch_size,
            "retmode": "xml",
            "api_key": NCBI_API_KEY
        }
        resp = rate_limited_get(url, params)
        root = ET.fromstring(resp.text)
        articles_batch = []
        for article in root.findall(".//PubmedArticle"):
            try:
                pmid = article.find(".//PMID").text
                title_elem = article.find(".//ArticleTitle")
                abstract_elem = article.find(".//Abstract/AbstractText")
                journal_elem = article.find(".//Journal/Title")
                pub_type_elem = article.find(".//PublicationTypeList/PublicationType")
                title = title_elem.text if title_elem is not None else ""
                abstract = abstract_elem.text if abstract_elem is not None else ""
                journal = journal_elem.text if journal_elem is not None else ""
                pub_type = pub_type_elem.text if pub_type_elem is not None else ""
                full_text = f"{title}\n{abstract}"
                articles_batch.append({
                    "source": "PubMed",
                    "pmid": pmid,
                    "title": title,
                    "text": full_text,
                    "journal": journal,
                    "publication_type": pub_type
                })
            except Exception as e:
                print("Error parsing article:", e)
        if not articles_batch:
            break
        all_articles.extend(articles_batch)
        start += batch_size
        pbar.update(1)
        if len(articles_batch) < batch_size:
            break
    pbar.close()
    return all_articles

# --------- NICE fetching ---------

def fetch_nice_guidelines():
    """Fetch published NICE guidelines."""
    url = "https://api.nice.org.uk/guidance?status=published"
    headers = {"Accept": "application/json"}
    resp = requests.get(url, headers=headers)
    data = resp.json()
    guidelines = []
    for g in data.get("guidance", []):
        try:
            guideline_id = g.get("guidanceId")
            detail_url = f"https://api.nice.org.uk/guidance/{guideline_id}"
            detail_resp = requests.get(detail_url, headers=headers)
            detail_data = detail_resp.json()
            title = detail_data.get("title", "")
            recs = detail_data.get("recommendations", "")
            text = title + "\n" + recs if recs else title
            guidelines.append({
                "source": "NICE",
                "guideline_id": guideline_id,
                "title": title,
                "text": text
            })
        except Exception as e:
            print("Error fetching NICE guideline:", e)
    return guidelines

# --------- Preprocessing ---------

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def chunk_text(text, chunk_size=CHUNK_SIZE):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunks.append(" ".join(words[i:i+chunk_size]))
    return chunks

# --------- Embedding ---------

def embed_texts(texts):
    vectors = []
    for chunk in tqdm(texts, desc="Embedding chunks", unit="chunk"):
        vec = embedder.encode(chunk, convert_to_numpy=True)
        vectors.append(vec)
    return np.array(vectors)

# ----------------------------
# BUILD KNOWLEDGE BASE
# ----------------------------

def build_knowledge_base():
    # 1. PubMed
    query = "(clinical trial[pt] OR systematic review[pt] OR guideline[pt] OR case reports[pt])"
    pmid_list, webenv, query_key, count = fetch_pubmed_pmids(query)
    print(f"Found {count} PubMed articles, fetching abstracts in batches...")
    pubmed_articles = fetch_pubmed_abstracts_batch(webenv, query_key)
    print(f"Fetched {len(pubmed_articles)} PubMed articles.")

    # 2. NICE
    nice_guidelines = fetch_nice_guidelines()
    print(f"Fetched {len(nice_guidelines)} NICE guidelines.")

    # Combine all documents
    all_docs = pubmed_articles + nice_guidelines

    # 3. Preprocess + chunk
    chunks = []
    metadata_list = []
    for doc in all_docs:
        text_clean = clean_text(doc["text"])
        text_chunks = chunk_text(text_clean)
        for chunk in text_chunks:
            chunks.append(chunk)
            metadata_list.append({k: v for k, v in doc.items() if k != "text"})

    # 4. Embedding
    print("Embedding chunks with MiniLM...")
    embeddings = embed_texts(chunks)

    # 5. FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings.astype("float32"))
    print(f"FAISS index created with {len(embeddings)} chunks.")

    return index, metadata_list

# ----------------------------
# SAVE KNOWLEDGE BASE
# ----------------------------

def save_knowledge_base(index, metadata_list, index_file="faiss_index.bin", metadata_file="metadata.json"):
    # Save FAISS index
    faiss.write_index(index, index_file)
    print(f"FAISS index saved to {index_file}")

    # Save metadata
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata_list, f, ensure_ascii=False, indent=2)
    print(f"Metadata saved to {metadata_file}")

# ----------------------------
# LOAD KNOWLEDGE BASE
# ----------------------------

# def load_knowledge_base(index_file="faiss_index.bin", metadata_file="metadata.json"):
#     # Load FAISS index
#     index = faiss.read_index(index_file)
#     print(f"FAISS index loaded from {index_file}")

#     # Load metadata
#     with open(metadata_file, "r", encoding="utf-8") as f:
#         metadata_list = json.load(f)
#     print(f"Metadata loaded from {metadata_file}")

#     return index, metadata_list

# ----------------------------
# RUN
# ----------------------------

if __name__ == "__main__":
    # Build the knowledge base
    index, metadata = build_knowledge_base()

    # Save to disk
    save_knowledge_base(index, metadata, index_file="pubmed_nice_index.faiss", metadata_file="pubmed_nice_metadata.json")

    # Later, you can load it like this:
    # index, metadata = load_knowledge_base("pubmed_nice_index.faiss", "pubmed_nice_metadata.json")

