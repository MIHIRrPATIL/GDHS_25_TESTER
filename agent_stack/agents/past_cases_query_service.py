"""
Gateway to query past medical cases using past_cases knowledge base. 
Uses FAISS to query.
"""

import faiss
from sentence_transformers import SentenceTransformer
import json 

embedder = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------
# Load FAISS + Metadata
# -----------------------
def load_past_cases(index_path="../past_cases/pubmed_nice_index.faiss", metadata_path="../past_cases/pubmed_nice_metadata.json"):
    index = faiss.read_index(index_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    return index, docs

# -----------------------
# Query Function
# -----------------------
def query_past_cases(query: str, top_k: int = 5):
    index, docs = load_past_cases()
    q_emb = embedder.encode([query], convert_to_numpy=True)
    distances, indices = index.search(q_emb, top_k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        doc = docs[idx]
        results.append({
            "source": doc.get("source", "unknown"),
            "pmid": doc.get("pmid"),
            "title": doc.get("title"),
            "journal": doc.get("journal"),
            "publication_type": doc.get("publication_type"),
            # build a "content-like" field for readability
            "content": f"{doc.get('title', '')} ({doc.get('journal', '')}, {doc.get('publication_type', '')})",
            "score": float(dist)
        })
    return results

# -----------------------
# Example
# -----------------------
if __name__ == "__main__":
    query = "treatment for malaria"
    res = query_past_cases(query)
    print("Query:", query)
    for r in res:
        print(r)
