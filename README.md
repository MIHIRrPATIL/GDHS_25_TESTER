# ChikitSahaya

**Tagline:**  
समये सम्यग्निर्णयः — *Wise decisions in time*

---

## 📌 Overview

**ChikitSahaya** is an intelligent clinical support platform designed for doctors to assist in patient onboarding, triage, and diagnosis.  
The system combines **LLM-powered reasoning**, **guideline-driven triage**, and **conversational diagnosis** to provide explainable AI-based assistance in real-time clinical settings.

---

## 🚀 How to Run
localhost deployment 
```
git clone https://github.com/MIHIRrPATIL/GDHS_25_TESTER.git
```
### 1. Frontend
```bash
cd chikitsahaya
npm i
npm run dev
```

### 2. Backend
```bash
cd backend
npm i
npm run start
```

### 3. Agentic AI
```bash
conda create --name gdhs25 
conda activate gdhs25
pip install -r requirements.txt

cd agent_stack/agents

python3 triage_bot_app.py
python3 diagnosis_agent_app.py
python3 poa_agent_app.py
```