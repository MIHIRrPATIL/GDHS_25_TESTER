"""
Guidelines Ingestion Pipeline (Step 2)
------------------------------------
- Parse WHO PDF clinical guidelines into text.
- Split text into manageable chunks.
- Embed using SentenceTransformer.
- Store in a separate FAISS index for semantic retrieval.
- Persist FAISS index and docs metadata for later use.
"""

import os
import faiss
import numpy as np
import json
from sentence_transformers import SentenceTransformer
from PyPDF2 import PdfReader

# Initialize embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------
# PDF Parsing
# -----------------------

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a WHO guideline PDF."""
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

# -----------------------
# Text Chunking
# -----------------------

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50):
    """Split text into overlapping chunks for embeddings."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

# -----------------------
# Build & Save FAISS Index for Guidelines
# -----------------------

def build_guidelines_index(pdf_paths: list, index_path: str = "guidelines_faiss.index", metadata_path: str = "guidelines_metadata.json"):
    """Ingest WHO guideline PDFs, embed, and store in FAISS."""
    docs = []

    for path in pdf_paths:
        text = extract_text_from_pdf(path)
        chunks = chunk_text(text)
        for c in chunks:
            docs.append({
                "source": os.path.basename(path),
                "content": c
            })

    # Encode embeddings
    embeddings = embedder.encode([d["content"] for d in docs], convert_to_numpy=True)

    # Build FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)

    # Save FAISS index and metadata
    faiss.write_index(index, index_path)
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

    return index, docs

# -----------------------
# Load Saved Index
# -----------------------

def load_guidelines_index(index_path: str = "guidelines_faiss.index", metadata_path: str = "guidelines_metadata.json"):
    index = faiss.read_index(index_path)
    with open(metadata_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    return index, docs

# -----------------------
# Search Function
# -----------------------

def search_guidelines(query: str, index, docs, top_k: int = 5):
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
# Example Usage
# -----------------------
if __name__ == "__main__":
    # Example: point to WHO PDFs stored locally
    import os
    folder_path = "pdfs/"

    pdf_files = []
    # The os.walk() function will go through the main folder and all its subfolders.
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, file))

    print(pdf_files)
    index, docs = build_guidelines_index(pdf_files)

    query = "management of acute stroke"
    results = search_guidelines(query, index, docs)

    print("Query:", query)
    for r in results:
        print(r)