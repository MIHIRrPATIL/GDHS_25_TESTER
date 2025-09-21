import os
import sys
import json
import traceback
import uuid
from typing import Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS

# Import your RAG service
from guidelines_query_service import query_guidelines

# Gemini client
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"

# In-memory session storage (use Redis/Database in production)
sessions = {}

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

def triage_step(user_message: str, symptom_dict: dict, message_history: str):
    """
    Update symptom dictionary using latest user input + entire conversation history.
    """

    prompt = f"""
    You are a medical triage assistant.

    Conversation so far (chronological):
    {json.dumps(message_history, indent=2)}

    Current Symptom Dictionary:
    {json.dumps(symptom_dict, indent=2)}

    Latest user message:
    \"{user_message}\"

    Task:
    - Use both the chat history and the latest user message to update the symptom dictionary.
    - Follow this schema strictly:
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
    If user asks worrisome or any emergency-related questions, give the user an empathic and kind response, suggesting that only a doctor can fully assure them.
    When the schema is filled completely with relevant symptoms, duration and severity, set_has_enough_info to true.
    DO NOT ASK TOO MANY QUESTIONS BESIDES ANYTHING RELATED TO THE SCHEMA.
    STOP ASKING QUESTIONS once has_enough_info is true.
    After updating the dictionary:
    - If has_enough_info is false → generate ONE empathetic follow-up question to gather missing details.
    - If has_enough_info is true → say "Thank you, I have enough information now."

    Return valid JSON ONLY with keys:
    {{
      "symptom_dict": <updated symptom_dict>,
      "bot_message": "<next bot question or final confirmation>"
    }}
    """

    response = call_gemini_stream(prompt)

    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        start = response.find("{")
        end = response.rfind("}")
        parsed = json.loads(response[start:end+1])

    return parsed


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
    "symptoms" : "<symptoms from symptom dict>",
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

def format_conversation(message_history):
    """
    Convert message history into a clean conversation transcript.
    
    Args:
        message_history (list): List of dicts with keys "type" ("bot"/"user") and "content".
    
    Returns:
        str: Formatted conversation transcript.
    """
    conversation_lines = []
    for msg in message_history:
        if msg["type"] == "bot":
            conversation_lines.append(f"Bot: {msg['content']}")
        elif msg["type"] == "user":
            conversation_lines.append(f"User: {msg['content']}")
    return "\n".join(conversation_lines)

# API Routes
@app.route('/api/start-session', methods=['POST'])
def start_session():
    """Initialize a new triage session"""
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "symptom_dict": {"symptoms": [], "has_enough_info": False},
        "conversation_history": [],
        "status": "active"
    }
    
    return jsonify({
        "session_id": session_id,
        "bot_message": "Hello! I'm here to help assess your symptoms. How are you feeling today?",
        "status": "active"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle user messages in triage conversation"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_message = data.get('message')
        # print("-------------- DATA ---------------\n", data)
        chat_history = data.get('message_history', [])
        if not session_id or not user_message:
            return jsonify({"error": "session_id and message are required"}), 400
            
        if session_id not in sessions:
            return jsonify({"error": "Invalid session_id"}), 404
            
        session = sessions[session_id]
        
        if session["status"] != "active":
            return jsonify({"error": "Session is no longer active"}), 400
        print("-------------- CHAT_HISTORY BEFORE FORMATTING---------------\n", chat_history)
        # Process the message
        chat_history = format_conversation(chat_history)
        print("-------------- CHAT_HISTORY AFTER FORMATTING---------------\n", chat_history)
        result = triage_step(user_message, session["symptom_dict"], chat_history)
        
        # Update session
        session["symptom_dict"] = result["symptom_dict"]
        session["conversation_history"].append({
            "user": user_message,
            "bot": result["bot_message"]
        })
        
        response_data = {
            "bot_message": result["bot_message"],
            "symptom_dict": result["symptom_dict"],
            "has_enough_info": result["symptom_dict"].get("has_enough_info", False)
        }
        
        # If we have enough info, generate triage
        if result["symptom_dict"].get("has_enough_info"):
            try:
                triage_result = generate_triage(result["symptom_dict"])
                session["triage_result"] = triage_result
                session["status"] = "completed"
                
                response_data.update({
                    "triage_complete": True,
                    "triage_result": triage_result
                })
            except Exception as e:
                return jsonify({"error": f"Triage generation failed: {str(e)}"}), 500
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get session details"""
    if session_id not in sessions:
        return jsonify({"error": "Session not found"}), 404
        
    session = sessions[session_id]
    return jsonify({
        "session_id": session_id,
        "symptom_dict": session["symptom_dict"],
        "conversation_history": session["conversation_history"],
        "status": session["status"],
        "triage_result": session.get("triage_result")
    })

@app.route('/api/session/<session_id>/triage', methods=['GET'])
def get_triage_result(session_id):
    """Get triage result for a session"""
    if session_id not in sessions:
        return jsonify({"error": "Session not found"}), 404
        
    session = sessions[session_id]
    
    if "triage_result" not in session:
        return jsonify({"error": "Triage not yet completed"}), 400
    print("----------------", session["triage_result"], "------------------")
    return jsonify(session["triage_result"])

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """List all sessions (for debugging/admin)"""
    return jsonify({
        "sessions": [
            {
                "session_id": sid,
                "status": session["status"],
                "message_count": len(session["conversation_history"]),
                "has_triage": "triage_result" in session
            }
            for sid, session in sessions.items()
        ]
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Triage API is running"})

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)