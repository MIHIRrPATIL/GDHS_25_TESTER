#triage and diagnosis agent 
"""
Input: Patient's json
LLM creates prompt to query guidelines knowledge base 
Retrieves context
Query LLM with context and patient info
Output: Triage and Diagnosis suggestions
"""
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from agent_stack.guidelines.query_service import query_guidelines

# -----------------------
# Gemini Setup
# -----------------------
load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.0-flash"

# -----------------------
# Helper: call Gemini
# -----------------------
def call_gemini(prompt: str) -> str:
    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=prompt)],
        ),
    ]
    generate_content_config = types.GenerateContentConfig()

    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=MODEL,
        contents=contents,
        config=generate_content_config,
    ):
        if chunk.text:
            response_text += chunk.text
    return response_text.strip()

# -----------------------
# Triage & Diagnosis Workflow
# -----------------------
def triage_and_diagnose(patient_json: dict):
    # Step 1: Generate a search query from patient data
    query_prompt = f"""
    Patient Data: {json.dumps(patient_json, indent=2)}

    Task: Create a concise medical query (5-15 words) that would help search
    a medical guidelines knowledge base to assist in triage and diagnosis.
    Only return the query text.
    """
    search_query = call_gemini(query_prompt)

    # Step 2: Retrieve guideline context
    context_results = query_guidelines(search_query, top_k=5)
    context_text = "\n\n".join([r["content"] for r in context_results])

    # Step 3: Get triage & diagnosis
    final_prompt = f"""
    Patient Data:
    {json.dumps(patient_json, indent=2)}

    Retrieved Guidelines Context:
    {context_text}

    Task:
    - Provide triage priority (Emergency, Urgent, Routine).
    - Suggest possible diagnoses (list top 3-5).
    - Highlight any red-flag symptoms requiring immediate intervention.
    - Keep output concise and clinical.
    """
    triage_diagnosis = call_gemini(final_prompt)

    return {
        "search_query": search_query,
        "guidelines_context": context_results,
        "triage_diagnosis": triage_diagnosis
    }

# -----------------------
# Example Usage
# -----------------------
if __name__ == "__main__":
    patient_data1 = {
    "firstName": "Harry",
    "lastName": "Nelson",
    "Age": 47,
    "Gender": "Male",
    "isSmoker": "Yes",
    "isDrunkard": "Yes",
    "Execises": "rarely",
    "chronic diseases": "Heart Disease",
    "allergies": "Shellfish",
    "currrent medications": "Aspirin",
    "Family medical history": "Heart Disease"
    }

    result = triage_and_diagnose(patient_data1)

    print("Search Query:", result["search_query"])
    print("\nTriage & Diagnosis:\n", result["triage_diagnosis"])

    # patient_data2 = {
    # "firstName": "Liam",
    # "lastName": "Roberts",
    # "Age": 53,
    # "Gender": "Male",
    # "isSmoker": "Yes",
    # "isDrunkard": "Yes",
    # "Execises": "never",
    # "chronic diseases": "Hypertension",
    # "allergies": "None",
    # "currrent medications": "Beta Blockers",
    # "Family medical history": "Heart Disease"
    # }

    # result = triage_and_diagnose(patient_data2)

    # print("Search Query:", result["search_query"])
    # print("\nTriage & Diagnosis:\n", result["triage_diagnosis"])

    # patient_data3 = {
    # "firstName": "Maya",
    # "lastName": "Turner",
    # "Age": 31,
    # "Gender": "Female",
    # "isSmoker": "No",
    # "isDrunkard": "No",
    # "Execises": "several times a week",
    # "chronic diseases": "None",
    # "allergies": "None",
    # "currrent medications": "None",
    # "Family medical history": "None"
    # }
    # result = triage_and_diagnose(patient_data3)

    # print("Search Query:", result["search_query"])
    # print("\nTriage & Diagnosis:\n", result["triage_diagnosis"])