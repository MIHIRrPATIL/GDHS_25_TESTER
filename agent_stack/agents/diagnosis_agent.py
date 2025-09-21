"""
An explainable diagnosis agent that queries past medical cases, guidlines, and provides the decision tree and its reasonings.
INPUT: full_context
query_past_cases
query_guidelines
USE AS CONTEXT
OUTPUT: LIST OF POSSIBLE DIAGNOSES WITH REASONINGS
"""

import json
from typing import Dict, Any, List
from guidelines_query_service import query_guidelines
from past_cases_query_service import query_past_cases

# Gemini API
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

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


def diagnosis_agent(full_context: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Generate possible diagnoses with reasoning using guidelines + past cases.
    Args:
        full_context: Patient info and symptoms (dict)
        top_k: number of results to retrieve from vector stores
    Returns:
        list of dict diagnoses
    """

    import json

    # -----------------------------
    # Step 1: Build search query
    # -----------------------------
    symptoms = full_context.get("symptoms", [])
    patient_info = [f"age {full_context.get('age')}", full_context.get("gender", "")]
    patient_info = [p for p in patient_info if p]

    sympt_texts = []
    for s in symptoms:
        parts = []
        if s.get("duration"):
            parts.append(f"duration: {s['duration']}")
        if s.get("severity"):
            parts.append(f"severity: {s['severity']}")
        if s.get("additional_context"):
            parts.append(s["additional_context"])
        if parts:
            sympt_texts.append(" ".join(parts))

    query = " ; ".join(patient_info + sympt_texts) or "patient case"

    # -----------------------------
    # Step 2: Query vector stores
    # -----------------------------
    guideline_hits = query_guidelines(query, top_k=top_k)
    past_case_hits = query_past_cases(query, top_k=top_k)

    # Build context text for LLM
    guideline_snips = []
    for i, r in enumerate(guideline_hits, start=1):
        guideline_snips.append(
            f"[G{i}] {r.get('content', '')} (source: {r.get('source')})"
        )

    past_snips = []
    for j, r in enumerate(past_case_hits, start=1):
        past_snips.append(
            f"[P{j}] {r.get('title', '')}: {r.get('content', '')} ({r.get('journal', '')}, PMID {r.get('pmid')})"
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

    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        start = response.find("[")
        end = response.rfind("]")
        parsed = json.loads(response[start:end+1])

    return parsed

# -----------------------------
# Example usage
# -----------------------------
import json
from diagnosis_agent import diagnosis_agent

# -----------------------------
# Mock Data (Python JSON-ready)
# -----------------------------
mock_patients = [
  {
    "id": "1",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@email.com",
    "password": "",
    "phone": "+1-555-0123",
    "contactNumber": "+1-555-0123",
    "dateOfBirth": "1985-03-15",
    "gender": "female",
    "age": 39,
    "height": 165,
    "weight": 62,
    "occupation": "Student",
    "medicalRecordNumber": "MR001234",
    "isSmoker": False,
    "isDrunkard": False,
    "exercise": "3 times/week",
    "chronicDiseases": ["Hypertension"],
    "allergies": ["Penicillin", "Shellfish"],
    "currentMedications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Daily",
        "prescribedBy": "Dr. Smith",
        "startDate": "2024-01-15",
        "active": True
      }
    ],
    "familyHistory": ["Father - Heart disease", "Mother - Diabetes"],
    "emergencyContactName": "John Johnson",
    "emergencyContactPhone": "+1-555-0987",
    "chiefComplaint": "Chest pain and shortness of breath",
    "lastTriageScore": 85,
    "hasAIInsights": True,
    "status": "waiting",
    "assignedDoctorId": "doc1",
    "createdAt": "2024-09-20T08:30:00Z",
    "updatedAt": "2024-09-20T09:15:00Z"
  },
  {
    "id": "2",
    "firstName": "Michael",
    "lastName": "Chen",
    "email": "michael.chen@email.com",
    "password": "",
    "phone": "+1-555-0456",
    "contactNumber": "+1-555-0456",
    "dateOfBirth": "1992-07-22",
    "gender": "male",
    "age": 31,
    "height": 178,
    "weight": 75,
    "occupation": "Student",
    "medicalRecordNumber": "MR001235",
    "isSmoker": True,
    "isDrunkard": False,
    "exercise": "1 time/week",
    "chronicDiseases": [],
    "allergies": ["Latex"],
    "currentMedications": [],
    "familyHistory": ["Mother - Migraine"],
    "emergencyContactName": "Linda Chen",
    "emergencyContactPhone": "+1-555-0567",
    "chiefComplaint": "Severe headache and nausea",
    "lastTriageScore": 72,
    "hasAIInsights": False,
    "status": "in-progress",
    "assignedDoctorId": "doc1",
    "createdAt": "2024-09-20T09:00:00Z",
    "updatedAt": "2024-09-20T09:30:00Z"
  },
  {
    "id": "3",
    "firstName": "Emily",
    "lastName": "Davis",
    "email": "emily.davis@email.com",
    "password": "",
    "phone": "+1-555-0789",
    "contactNumber": "+1-555-0789",
    "dateOfBirth": "1978-11-05",
    "gender": "female",
    "age": 46,
    "height": 160,
    "weight": 58,
    "occupation": "Student",
    "medicalRecordNumber": "MR001236",
    "isSmoker": False,
    "isDrunkard": False,
    "exercise": "None",
    "chronicDiseases": ["Diabetes"],
    "allergies": [],
    "currentMedications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "prescribedBy": "Dr. Lee",
        "startDate": "2023-06-01",
        "active": True
      }
    ],
    "familyHistory": ["Father - Stroke", "Mother - Hypertension"],
    "emergencyContactName": "Robert Davis",
    "emergencyContactPhone": "+1-555-0890",
    "chiefComplaint": "Fatigue and dizziness",
    "lastTriageScore": 65,
    "hasAIInsights": True,
    "status": "waiting",
    "assignedDoctorId": "doc2",
    "createdAt": "2024-09-20T08:45:00Z",
    "updatedAt": "2024-09-20T09:20:00Z"
  },
  {
    "id": "4",
    "firstName": "David",
    "lastName": "Martinez",
    "email": "david.martinez@email.com",
    "password": "",
    "phone": "+1-555-0912",
    "contactNumber": "+1-555-0912",
    "dateOfBirth": "1989-02-19",
    "gender": "male",
    "age": 36,
    "height": 182,
    "weight": 80,
    "occupation": "Student",
    "medicalRecordNumber": "MR001237",
    "isSmoker": False,
    "isDrunkard": True,
    "exercise": "2 times/week",
    "chronicDiseases": ["Asthma"],
    "allergies": ["Aspirin"],
    "currentMedications": [
      {
        "name": "Atorvastatin",
        "dosage": "20mg",
        "frequency": "Daily",
        "prescribedBy": "Dr. Green",
        "startDate": "2023-09-10",
        "active": True
      }
    ],
    "familyHistory": ["Mother - Asthma"],
    "emergencyContactName": "Laura Martinez",
    "emergencyContactPhone": "+1-555-0678",
    "chiefComplaint": "Shortness of breath during exercise",
    "lastTriageScore": 78,
    "hasAIInsights": True,
    "status": "in-progress",
    "assignedDoctorId": "doc2",
    "createdAt": "2024-09-20T09:10:00Z",
    "updatedAt": "2024-09-20T09:45:00Z"
  },
  {
    "id": "5",
    "firstName": "Olivia",
    "lastName": "Brown",
    "email": "olivia.brown@email.com",
    "password": "",
    "phone": "+1-555-0345",
    "contactNumber": "+1-555-0345",
    "dateOfBirth": "2000-05-30",
    "gender": "female",
    "age": 23,
    "height": 168,
    "weight": 60,
    "occupation": "Student",
    "medicalRecordNumber": "MR001238",
    "isSmoker": False,
    "isDrunkard": False,
    "exercise": "4 times/week",
    "chronicDiseases": [],
    "allergies": ["Peanuts"],
    "currentMedications": [],
    "familyHistory": ["Father - Diabetes"],
    "emergencyContactName": "Sophia Brown",
    "emergencyContactPhone": "+1-555-0781",
    "chiefComplaint": "Abdominal pain and nausea",
    "lastTriageScore": 70,
    "hasAIInsights": False,
    "status": "waiting",
    "assignedDoctorId": "doc3",
    "createdAt": "2024-09-20T09:20:00Z",
    "updatedAt": "2024-09-20T09:50:00Z"
  }
]


# -----------------------------
# Run diagnosis agent on each
# -----------------------------
if __name__ == "__main__":
    for patient in mock_patients:
        print("="*60)
        print(f"Running diagnosis for {patient['firstName']} {patient['lastName']} (ID: {patient['id']})")
        result = diagnosis_agent(patient, top_k=3)
        print(json.dumps(result, indent=2))

