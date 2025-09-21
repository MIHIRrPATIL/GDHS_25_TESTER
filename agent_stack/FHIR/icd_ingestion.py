"""
icd_ingest_faiss.py
Prototype ingestion: ClinicalTables (ICD-10-CM) + ICD10API enrichment -> embeddings -> FAISS

Outputs:
- icd_faiss.index         (FAISS binary)
- icd_metadata.json       (list of dicts, index -> record)
- icd_docs.json           (plain text records used for embeddings)
"""

import requests
import time
import json
from typing import List, Dict, Any, Tuple, Optional
from tqdm import tqdm
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

# --------------------
# Config
# --------------------
CLINICAL_TABLES_BASE = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search"
ICD10API_BASE = "http://www.icd10api.com/"   # simple code lookup: ?code=J10&r=json&desc=long
EMBED_MODEL = "all-MiniLM-L6-v2"
FAISS_INDEX_PATH = "icd_faiss.index"
METADATA_PATH = "icd_metadata.json"
DOCS_PATH = "icd_docs.json"
REQUEST_SLEEP = 0.15  # polite rate limit (seconds)


# --------------------
# Helpers: ClinicalTables search
# Docs: https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html
# --------------------
def search_icd10cm(term: str, count: int = 50, offset: int = 0) -> List[Tuple[str, str]]:
    """
    Query ClinicalTables ICD-10-CM for a search term.
    Returns list of (code, name) tuples.
    """
    params = {
        "terms": term,
        "sf": "code,name",
        "df": "code,name",
        "count": count,
        "offset": offset
    }
    resp = requests.get(CLINICAL_TABLES_BASE, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()
    # format: [ total, [codes], {extra}, [[display strings...]] ]
    # data[1] -> codes ; data[3] -> display pairs (as arrays of arrays)
    codes = data[1]
    displays = data[3] if len(data) > 3 else []
    results = []
    for idx, code in enumerate(codes):
        try:
            display = displays[idx][0] if idx < len(displays) else ""
        except Exception:
            display = ""
        results.append((code, display))
    time.sleep(REQUEST_SLEEP)
    return results


# --------------------
# Optional enrichment with ICD10API
# Docs: http://www.icd10api.com/
# --------------------
def fetch_icd10api_details(code: str) -> Optional[Dict[str, Any]]:
    """
    Fetch detailed metadata for an ICD code from ICD10API.com
    Returns JSON with Description, Valid, Inclusions, Excludes etc.
    """
    params = {"code": code, "r": "json", "desc": "long"}
    try:
        resp = requests.get(ICD10API_BASE, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if not data.get("Response"):
            return None
        return {
            "code": data.get("Code"),
            "description": data.get("Description"),
            "valid": data.get("Valid"),
            "includes": data.get("Inclusions", []),
            "excludes_one": data.get("ExcludesOne", []),
            "excludes_two": data.get("ExcludesTwo", []),
            "type": data.get("Type"),
        }
    except Exception as e:
        # network / parse error -> return None
        return None
    finally:
        time.sleep(REQUEST_SLEEP)


# --------------------
# Ingest pipeline (term list -> unique codes)
# --------------------
def ingest_codes_from_terms(terms: List[str], per_term_max: int = 50) -> List[Dict[str, Any]]:
    """
    For each term, search clinical tables and enrich with ICD10API.
    Returns list of records {code, name, description, includes, excludes, source}
    """
    seen = {}
    records = []
    for t in tqdm(terms, desc="Searching terms"):
        try:
            hits = search_icd10cm(t, count=per_term_max)
        except Exception as e:
            print(f"[WARN] clinical tables failed for '{t}': {e}")
            hits = []
        for code, name in hits:
            if code in seen:
                continue
            seen[code] = True
            # try ICD10API enrichment
            detail = fetch_icd10api_details(code)
            record = {
                "code": code,
                "name": name,
                "description": detail.get("description") if detail else name,
                "valid": detail.get("valid") if detail else None,
                "includes": detail.get("includes") if detail else [],
                "excludes_one": detail.get("excludes_one") if detail else [],
                "excludes_two": detail.get("excludes_two") if detail else [],
                "source": "clinicaltables+icd10api" if detail else "clinicaltables"
            }
            records.append(record)
    return records


# --------------------
# Embedding + FAISS index build
# --------------------
def build_faiss_index(records: List[Dict[str, Any]], model_name: str = EMBED_MODEL,
                      index_path: str = FAISS_INDEX_PATH, metadata_path: str = METADATA_PATH,
                      docs_path: str = DOCS_PATH):
    """
    Builds sentence embeddings for records and writes FAISS index + metadata json.
    Each vector corresponds to a record; metadata list aligns with index ids.
    Uses cosine similarity via IndexFlatIP on normalized embeddings.
    """
    model = SentenceTransformer(model_name)
    texts = []
    for r in records:
        txt = f"{r['code']} {r['name']}. {r.get('description','')}"
        texts.append(txt)

    # encode
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    # normalize to unit vectors (for cosine similarity with inner product index)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1e-8
    embeddings = embeddings / norms

    d = embeddings.shape[1]
    index = faiss.IndexFlatIP(d)  # inner product on normalized vectors -> cosine similarity
    index.add(embeddings.astype('float32'))

    # persist index and metadata
    faiss.write_index(index, index_path)
    # metadata: keep list of records aligned with the vector ids
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    with open(docs_path, "w", encoding="utf-8") as f:
        json.dump(texts, f, ensure_ascii=False, indent=2)

    print(f"[OK] saved index -> {index_path}, metadata -> {metadata_path}, docs -> {docs_path}")


# --------------------
# Simple search utility (using saved index + metadata)
# --------------------
def load_index_and_metadata(index_path: str = FAISS_INDEX_PATH, metadata_path: str = METADATA_PATH, model_name: str = EMBED_MODEL):
    index = faiss.read_index(index_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)
    model = SentenceTransformer(model_name)
    return index, metadata, model


def faiss_search(query: str, k: int = 5, index=None, metadata=None, model=None):
    q_emb = model.encode([query], convert_to_numpy=True)
    q_emb = q_emb / (np.linalg.norm(q_emb, axis=1, keepdims=True) + 1e-10)
    D, I = index.search(q_emb.astype('float32'), k)
    results = []
    for dist, idx in zip(D[0], I[0]):
        rec = metadata[idx]
        results.append({"score": float(dist), "record": rec})
    return results


# --------------------
# Example usage: minimal
# --------------------
if __name__ == "__main__":
    # example seed terms (you will feed these from your symptom->disease map or a file)
    seed_terms = [
        "myocardial infarction", "pneumonia", "influenza", "covid", "dengue",
        "pulmonary embolism", "appendicitis", "sepsis", "stroke", "epilepsy"
    ]

    print("Step 1: ingesting ICD codes for seed terms...")
    records = ingest_codes_from_terms(seed_terms, per_term_max=30)
    print(f"ingested {len(records)} unique codes")

    print("Step 2: building FAISS index and saving metadata...")
    build_faiss_index(records)

    # Quick search test:
    idx, meta, model = load_index_and_metadata()
    q = "patient with chest pain and ST elevation"
    print("Search results for:", q)
    for r in faiss_search(q, k=5, index=idx, metadata=meta, model=model):
        print(r)