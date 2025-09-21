import faiss
import json
from sentence_transformers import SentenceTransformer

# Load embedder
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------
# Load FAISS + Metadata
# -----------------------
def load_icd_index(index_path="icd/icd_faiss.index", metadata_path="icd/icd_metadata.json"):
    index = faiss.read_index(index_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    return index, docs

# -----------------------
# Query Function
# -----------------------
def query_icd(query: str, top_k: int = 5):
    index, docs = load_icd_index()
    q_emb = embedder.encode([query], convert_to_numpy=True)
    distances, indices = index.search(q_emb, top_k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        results.append({
            "code": docs[idx]["code"],
            "description": docs[idx]["description"],
            "score": float(dist)
        })
    return results

# -----------------------
# Example
# -----------------------
if __name__ == "__main__":
    query = "myocardial infarction"
    res = query_icd(query)
    print("Query:", query)
    for r in res:
        print(r)
