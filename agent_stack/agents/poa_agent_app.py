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


def generate_plan_of_action(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a medical plan of action based on patient data, history, and diagnoses.
    
    Args:
        patient_data (Dict[str, Any]): Dictionary containing diagnoses, medical history, hereditary info, lifestyle factors, etc.
    
    Returns:
        Dict[str, Any]: Suggested plan of action including recommended investigations, treatments, and follow-ups.
    """
    try:
        # Extract relevant details
        diagnoses = patient_data.get("diagnoses", [])
        history = patient_data.get("medical_history", {})
        hereditary = patient_data.get("hereditary_conditions", {})
        lifestyle = patient_data.get("lifestyle_factors", {})

        if not diagnoses:
            raise ValueError("At least one diagnosis is required to generate a plan of action")

        logger.info(f"Generating plan for diagnoses: {diagnoses}")

        # Query clinical guidelines for each diagnosis
        guidelines_results = []
        for diagnosis in diagnoses:
            try:
                guidelines = query_guidelines(diagnosis)
                guidelines_results.append({
                    "diagnosis": diagnosis,
                    "guidelines": guidelines
                })
            except Exception as e:
                logger.warning(f"Failed to query guidelines for {diagnosis}: {str(e)}")
                guidelines_results.append({
                    "diagnosis": diagnosis,
                    "guidelines": [],
                    "error": str(e)
                })
        
        # Query past similar cases
        past_cases_results = []
        for diagnosis in diagnoses:
            try:
                past_cases = query_past_cases(diagnosis)
                past_cases_results.append({
                    "diagnosis": diagnosis,
                    "past_cases": past_cases
                })
            except Exception as e:
                logger.warning(f"Failed to query past cases for {diagnosis}: {str(e)}")
                past_cases_results.append({
                    "diagnosis": diagnosis,
                    "past_cases": [],
                    "error": str(e)
                })

        # Prepare prompt for Gemini API
        prompt = f"""
You are a medical AI assistant. Generate a personalized plan of action based on the following patient data:

Patient History: {json.dumps(history, indent=2)}
Hereditary Conditions: {json.dumps(hereditary, indent=2)}
Lifestyle Factors: {json.dumps(lifestyle, indent=2)}
Diagnoses: {json.dumps(diagnoses, indent=2)}

Clinical Guidelines: {json.dumps(guidelines_results, indent=2)}
Past Cases: {json.dumps(past_cases_results, indent=2)}

Provide a structured plan of action including:
1. Recommended investigations
2. Treatment options
3. Lifestyle or behavioral recommendations
4. Follow-up schedule

Format the response as a valid JSON object with this exact schema:
{{
    "plan_of_action": ["step 1", "step 2", "step 3"],
    "guidelines_reference": ["ref 1", "ref 2"],
    "past_cases_reference": ["case 1", "case 2"]
}}

Return ONLY the JSON object, no additional text.
"""

        # Call Gemini API
        response = call_gemini(prompt)
        logger.info(f"Gemini response received: {len(response)} characters")
        
        try:
            # Try to parse the response as JSON
            parsed_response = json.loads(response)
            
            # Validate the structure
            if not isinstance(parsed_response, dict):
                raise ValueError("Response is not a JSON object")
            
            # Ensure required keys exist
            required_keys = ["plan_of_action", "guidelines_reference", "past_cases_reference"]
            for key in required_keys:
                if key not in parsed_response:
                    parsed_response[key] = []
            
            return {
                "plan_of_action": parsed_response.get("plan_of_action", []),
                "guidelines_reference": guidelines_results,
                "past_cases_reference": past_cases_results,
                "ai_generated_plan": parsed_response
            }
            
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw response with references
            logger.warning("Failed to parse JSON response, returning raw text")
            return {
                "plan_of_action": response.strip(),
                "guidelines_reference": guidelines_results,
                "past_cases_reference": past_cases_results,
                "ai_generated_plan": {"raw_response": response.strip()}
            }

    except Exception as e:
        logger.error(f"Error in generate_plan_of_action: {str(e)}")
        logger.error(traceback.format_exc())
        raise


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "plan-of-action-agent",
        "port": 5002
    }), 200


@app.route('/generate-plan', methods=['POST'])
def generate_plan():
    """
    Main plan generation endpoint
    
    Expected JSON payload:
    {
        "patient_data": {
            "diagnoses": ["Hypertension", "Type 2 Diabetes"],
            "medical_history": {"age": 55, "weight": 85, "smoking": true},
            "hereditary_conditions": {"father": "Heart Disease"},
            "lifestyle_factors": {"diet": "high sugar", "exercise": "low"}
        }
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

        # Validate that diagnoses exist
        if not patient_data.get('diagnoses') or not isinstance(patient_data['diagnoses'], list):
            return jsonify({
                "error": "Missing or invalid 'diagnoses' in patient_data. Must be a non-empty list.",
                "status": "error"
            }), 400

        logger.info(f"Processing plan generation request for diagnoses: {patient_data.get('diagnoses')}")

        # Generate plan of action
        plan_result = generate_plan_of_action(patient_data)

        response = {
            "status": "success",
            "patient_diagnoses": patient_data.get('diagnoses'),
            "plan_of_action": plan_result.get("plan_of_action"),
            "guidelines_reference": plan_result.get("guidelines_reference"),
            "past_cases_reference": plan_result.get("past_cases_reference"),
            "ai_generated_plan": plan_result.get("ai_generated_plan")
        }

        logger.info("Successfully generated plan of action")
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
            "POST /generate-plan"
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
    
    logger.info("Starting Plan of Action Agent Flask API on port 5002")
    logger.info("Available endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /generate-plan - Generate medical plan of action")
    
    app.run(host='0.0.0.0', port=5002, debug=True)