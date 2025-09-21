from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from typing import Dict, Any, List
import logging
import traceback

# Import your existing services
from guidelines_query_service import query_guidelines
from past_cases_query_service import query_past_cases

# Gemini API
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"


def call_gemini(prompt: str) -> str:
    """Stream-safe Gemini wrapper"""
    try:
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
    except Exception as e:
        logger.error(f"Error calling Gemini API: {str(e)}")
        raise


def diagnosis_agent(full_context: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Generate possible diagnoses with reasoning using guidelines + past cases.
    Args:
        full_context: Patient info and symptoms (dict)
        top_k: number of results to retrieve from vector stores
    Returns:
        list of dict diagnoses
    """
    try:
        # -----------------------------
        # Step 1: Build search query
        # -----------------------------
        symptoms = full_context.get("symptoms", [])
        patient_info = [f"age {full_context.get('age')}", full_context.get("gender", "")]
        patient_info = [p for p in patient_info if p and str(p).strip()]

        # Handle symptoms - check if it's a list of dicts or strings
        sympt_texts = []
        if symptoms:
            for s in symptoms:
                if isinstance(s, dict):
                    parts = []
                    if s.get("duration"):
                        parts.append(f"duration: {s['duration']}")
                    if s.get("severity"):
                        parts.append(f"severity: {s['severity']}")
                    if s.get("additional_context"):
                        parts.append(s["additional_context"])
                    if parts:
                        sympt_texts.append(" ".join(parts))
                elif isinstance(s, str):
                    sympt_texts.append(s)
        
        # If no structured symptoms, use chief complaint
        if not sympt_texts and full_context.get("chiefComplaint"):
            sympt_texts.append(full_context["chiefComplaint"])

        query = " ; ".join(patient_info + sympt_texts) or "patient case"
        logger.info(f"Generated query: {query}")

        # -----------------------------
        # Step 2: Query vector stores
        # -----------------------------
        guideline_hits = query_guidelines(query, top_k=top_k)
        past_case_hits = query_past_cases(query, top_k=top_k)

        # Build context text for LLM
        guideline_snips = []
        for i, r in enumerate(guideline_hits, start=1):
            guideline_snips.append(
                f"[G{i}] {r.get('content', '')} (source: {r.get('source', 'unknown')})"
            )

        past_snips = []
        for j, r in enumerate(past_case_hits, start=1):
            past_snips.append(
                f"[P{j}] {r.get('title', '')}: {r.get('content', '')} ({r.get('journal', 'unknown')}, PMID {r.get('pmid', 'N/A')})"
            )

        combined_context = "\n".join(guideline_snips + past_snips)

        # -----------------------------
        # Step 3: LLM reasoning
        # -----------------------------
        prompt = f"""
You are an explainable diagnosis assistant.

Patient Context:
{json.dumps(full_context, indent=2)}

Retrieved Guidelines and Past Cases:
{combined_context}

Task:
- Provide a list of possible diagnoses based on the patient context, guidelines, and past cases.
- For each diagnosis:
  - include "name"
  - include "reasoning" (reference snippets like [G1], [P2] AND include the content of those snippets inline)
  - include "supporting_evidence" (list of snippet refs)
  - include "evidence_content" (dict mapping each snippet ref to its content)
  - include "confidence" (low/medium/high)
- Return valid JSON ONLY as a list of dicts, e.g.:

[
  {{
    "name": "Malaria",
    "reasoning": "Patient shows fever and travel history... supported by [G2], [P1]",
    "supporting_evidence": ["G2", "P1"],
    "evidence_content": {{
        "G2": "Fever, chills, and headache are common in malaria...",
        "P1": "Case study: patient with fever and travel to endemic region..."
    }},
    "confidence": "high"
  }}
]
"""

        response = call_gemini(prompt)
        logger.info(f"Gemini response received: {len(response)} characters")

        try:
            parsed = json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from response
            start = response.find("[")
            end = response.rfind("]")
            if start != -1 and end != -1:
                parsed = json.loads(response[start:end+1])
            else:
                logger.error(f"Could not parse JSON from response: {response}")
                raise ValueError("Invalid JSON response from AI model")

        return parsed

    except Exception as e:
        logger.error(f"Error in diagnosis_agent: {str(e)}")
        logger.error(traceback.format_exc())
        raise


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "diagnosis-agent",
    }), 200


@app.route('/diagnose', methods=['POST'])
def diagnose():
    """
    Main diagnosis endpoint
    
    Expected JSON payload:
    {
        "patient_data": { ... },  // Full patient context
        "top_k": 5               // Optional: number of results to retrieve
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({
                "error": "Request must be JSON",
                "status": "error"
            }), 400

        data = request.get_json()
        
        if not data or 'patient_data' not in data:
            return jsonify({
                "error": "Missing 'patient_data' in request body",
                "status": "error"
            }), 400

        patient_data = data['patient_data']
        top_k = data.get('top_k', 5)

        # Validate top_k
        if not isinstance(top_k, int) or top_k < 1 or top_k > 20:
            return jsonify({
                "error": "top_k must be an integer between 1 and 20",
                "status": "error"
            }), 400

        logger.info(f"Processing diagnosis request for patient ID: {patient_data.get('id', 'unknown')}")

        # Call diagnosis agent
        diagnoses = diagnosis_agent(patient_data, top_k=top_k)

        response = {
            "status": "success",
            "patient_id": patient_data.get('id'),
            "diagnoses": diagnoses,
            "total_diagnoses": len(diagnoses),
            "parameters": {
                "top_k": top_k
            }
        }

        logger.info(f"Successfully generated {len(diagnoses)} diagnoses")
        return jsonify(response), 200

    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        return jsonify({
            "error": str(ve),
            "status": "error",
            "type": "validation_error"
        }), 400

    except Exception as e:
        logger.error(f"Internal server error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            "error": "Internal server error",
            "status": "error",
            "type": "internal_error",
            "details": str(e)
        }), 500





@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Endpoint not found",
        "status": "error",
        "available_endpoints": [
            "GET /health",
            "POST /diagnose"
        ]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "error": "Internal server error",
        "status": "error"
    }), 500


if __name__ == '__main__':
    # Check for required environment variables
    if not os.getenv("GEMINI_API_KEY"):
        logger.error("GEMINI_API_KEY environment variable not set")
        exit(1)
    
    logger.info("Starting Diagnosis Agent Flask API on port 5001")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /diagnose - Single patient diagnosis")
    
    app.run(host='0.0.0.0', port=5001, debug=True)