import json
from typing import Dict, Any, List
from guidelines_query_service import query_guidelines
from past_cases_query_service import query_past_cases

# Gemini API
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"

def call_gemini(prompt: str) -> str:
    """Stream-safe Gemini wrapper"""
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

def generate_plan_of_action(patient_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates a medical plan of action based on patient data, history, and diagnoses.
    
    Args:
        patient_data (Dict[str, Any]): Dictionary containing diagnoses, medical history, hereditary info, lifestyle factors, etc.
    
    Returns:
        Dict[str, Any]: Suggested plan of action including recommended investigations, treatments, and follow-ups.
    """
    
    # Extract relevant details
    diagnoses = patient_data.get("diagnoses", [])
    history = patient_data.get("medical_history", {})
    hereditary = patient_data.get("hereditary_conditions", {})
    lifestyle = patient_data.get("lifestyle_factors", {})

    # Query clinical guidelines for each diagnosis
    guidelines_results = []
    for diagnosis in diagnoses:
        guidelines = query_guidelines(diagnosis)
        guidelines_results.append({
            "diagnosis": diagnosis,
            "guidelines": guidelines
        })
    
    # Query past similar cases (diagnosis only, per function definition)
    past_cases_results = []
    for diagnosis in diagnoses:
        past_cases = query_past_cases(diagnosis)
        past_cases_results.append({
            "diagnosis": diagnosis,
            "past_cases": past_cases
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

    Format the response in a json object with this schema: 
    {
        {
            "plan_of_action : <List of plan of action steps>"
            "guidelines_reference : <List all the guidelines_references>"
            "past_cases_reference : <List all past_case_references>"     
        }
    }
    """

    # Call Gemini API
    response = call_gemini(prompt)
    print("RESPONSE : ", response)
    plan_of_action = response.strip()

    return {
        "plan_of_action": plan_of_action,
        "guidelines_reference": guidelines_results,
        "past_cases_reference": past_cases_results
    }

# Example usage
if __name__ == "__main__":
    sample_patient = {
        "diagnoses": ["Hypertension", "Type 2 Diabetes"],
        "medical_history": {"age": 55, "weight": 85, "smoking": True, "previous_surgeries": ["appendectomy"]},
        "hereditary_conditions": {"father": "Heart Disease", "mother": "Diabetes"},
        "lifestyle_factors": {"diet": "high sugar", "exercise": "low"}
    }

    plan = generate_plan_of_action(sample_patient)
    print(json.dumps(plan, indent=2))
