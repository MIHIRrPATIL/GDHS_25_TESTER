import faiss
import json
from sentence_transformers import SentenceTransformer

# Load embedder
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------
# Load FAISS + Metadata
# -----------------------
def load_guidelines_index(index_path="../guidelines/guidelines_faiss.index", metadata_path="../guidelines/guidelines_metadata.json"):
    index = faiss.read_index(index_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    return index, docs

# -----------------------
# Query Function
# -----------------------
def query_guidelines(query: str, top_k: int = 5):
    index, docs = load_guidelines_index()
    q_emb = embedder.encode([query], convert_to_numpy=True)
    distances, indices = index.search(q_emb, top_k)

    results = []
    for idx, dist in zip(indices[0], distances[0]):
        results.append({
            "source": docs[idx]["source"],
            "content": docs[idx]["content"],
            "score": float(dist)
        })
    return results

# -----------------------
# Example
# -----------------------
if __name__ == "__main__":
    query = "treatment for malaria"
    res = query_guidelines(query)
    print("Query:", query)
    for r in res:
        print(r)
