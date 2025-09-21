# agents/triage_workflow.py
import os
import sys
import json
import traceback
from typing import Dict, Any

# # Ensure project root is on path
# root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# if root not in sys.path:
#     sys.path.append(root)
# Import your RAG service
from guidelines_query_service import query_guidelines

# Gemini client
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"
API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Please set GEMINI_API_KEY environment variable")

def call_gemini_stream(prompt: str) -> str:
    contents = [types.Content(role="user", parts=[types.Part.from_text(text=prompt)])]
    cfg = types.GenerateContentConfig()
    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=cfg,
    ):
        if getattr(chunk, "text", None):
            response_text += chunk.text
    return response_text.strip()


# ------------------------
# TRIAGE QnA BOT
# ------------------------
def triage_step(user_message: str, symptom_dict: dict):
    prompt = f"""
    You are a medical triage assistant.

    Extract and update the structured symptom dictionary below with information 
    from the user's latest message. Follow the schema strictly:
    {{
      "symptoms": [
        {{
          "name": "<symptom name>",
          "duration": "<duration if mentioned, else null>",
          "severity": "<severity if mentioned, else null>",
          "additional_context": "<frequency, location, triggers, etc. if mentioned, else null>"
        }}
      ],
      "has_enough_info": <true/false>
    }}

    Current Symptom Dictionary:
    {json.dumps(symptom_dict, indent=2)}

    User's latest message:
    \"{user_message}\"

    After updating the dictionary:
    - If has_enough_info is false, generate ONE empathetic follow-up question to gather missing details.
    - If has_enough_info is true, say "Thank you, I have enough information now."
    Return your answer in JSON with keys: "symptom_dict" and "bot_message".
    """

    response = call_gemini_stream(prompt)

    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        start = response.find("{")
        end = response.rfind("}")
        parsed = json.loads(response[start:end+1])

    return parsed


# ------------------------
# TRIAGE GENERATOR
# ------------------------
def build_search_query_from_symptoms(symptom_dict: Dict[str, Any]) -> str:
    patient_info = []
    if symptom_dict.get("age"):
        patient_info.append(f"age {symptom_dict['age']}")
    if symptom_dict.get("gender"):
        patient_info.append(str(symptom_dict["gender"]))

    sympt_texts = []
    for s in symptom_dict.get("symptoms", []):
        parts = []
        if s.get("duration"):
            parts.append(f"duration: {s['duration']}")
        if s.get("severity"):
            parts.append(f"severity: {s['severity']}")
        if s.get("additional_context"):
            parts.append(s["additional_context"])
        if parts:
            sympt_texts.append(" ".join(parts))

    query = " ; ".join(patient_info + sympt_texts) if (patient_info or sympt_texts) else "patient symptoms"
    return query[:400]

def generate_triage(symptom_dict: dict, top_k: int = 5) -> dict:
    if not symptom_dict.get("has_enough_info", False):
        raise ValueError("symptom_dict must have has_enough_info = true before triage generation")

    search_query = build_search_query_from_symptoms(symptom_dict)
    rag_results = query_guidelines(search_query, top_k=top_k)

    context_snippets = []
    rag_trace = []
    for i, r in enumerate(rag_results, start=1):
        src = r.get("source", "unknown")
        content = r.get("content", "")
        score = r.get("score", None)
        context_snippets.append(f"[{i}] Source: {src}\n{content}\n")
        rag_trace.append({"source": src, "content": content, "score": score})

    context_text = "\n---\n".join(context_snippets) if context_snippets else "No guidelines found."

    prompt = f"""
You are a concise medical triage assistant. Use the provided patient information and guideline context to decide a triage level.

Patient Symptom JSON (finalized):
{json.dumps(symptom_dict, indent=2)}

Retrieved guideline snippets:
{context_text}

Task:
- Decide a single triage_level from: "Emergency", "Urgent", "Routine".
- Provide a concise clinical "reason" explaining the decision. Reference relevant snippet numbers.
- Output valid JSON ONLY with keys:
  {{
    "triage_level": "<Emergency|Urgent|Routine>",
    "reason": "<reason with snippet refs>",
    "rag_trace": [ ... ]
  }}
"""

    response_text = call_gemini_stream(prompt)

    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError:
        start = response_text.find("{")
        end = response_text.rfind("}")
        parsed = json.loads(response_text[start:end+1])

    if "rag_trace" not in parsed:
        parsed["rag_trace"] = rag_trace

    return parsed


# ------------------------
# MAIN WORKFLOW
# ------------------------
if __name__ == "__main__":
    symptom_dict = {"symptoms": [], "has_enough_info": False}

    print("Bot: How are you feeling today?")
    while True:
        user_input = input("You: ")
        result = triage_step(user_input, symptom_dict)
        symptom_dict = result["symptom_dict"]
        print("Bot:", result["bot_message"])

        if symptom_dict.get("has_enough_info"):
            print("\n[Bot] Enough info collected. Generating triage...")
            triage_result = generate_triage(symptom_dict)
            print("\nFinal Triage Result:\n", json.dumps(triage_result, indent=2))

            # Save
            with open("triage_result.json", "w", encoding="utf-8") as f:
                json.dump(triage_result, f, ensure_ascii=False, indent=2)
            print("[OK] triage_result.json saved.")
            break