const extractSymptoms = `You are given a medical conversation between a doctor and a patient.
The conversation is provided as two separate lists:
- "doctor_utterances": things the doctor said
- "patient_utterances": things the patient said

Your task:
1. Extract all **precise symptoms** mentioned by the patient (not doctor’s suggestions, assumptions, or repeated confirmations).  
2. Capture only patient-experienced symptoms, not questions or advice from the doctor.  
3. Output a JSON object with the following structure:

{
  "symptoms": [
    {
      "name": "<symptom name>",
      "duration": "<duration if mentioned, else null>",
      "severity": "<severity if mentioned, else null>",
      "additional_context": "<any relevant detail such as frequency, location, triggers, etc., else null>"
    }
  ]
}

Guidelines:
- Be concise, factual, and stick to what the patient explicitly reports.  
- If a symptom is implied by the patient, include it but mark unclear parts as null.  
- Do not include diagnoses, causes, or doctor’s assumptions. Only patient-reported symptoms.  
- If no symptoms are found, return {"symptoms": []}.
`;

const getSymptoms = async (doctor, patient) => {
  try {
    const prompt = `
${extractSymptoms}

Doctor: ${doctor}

Patient: ${patient}
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free", // you can use gemini-2.0-flash if you prefer
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    let aiMessage = "";

    const messageObj = data.choices?.[0]?.message;

    if (messageObj) {
      // Check if 'content' is an array
      if (Array.isArray(messageObj.content)) {
        aiMessage = messageObj.content
          .map(item => item.type === "text" ? item.text : "")
          .join("\n");
      } else if (typeof messageObj.content === "string") {
        // Some models may return a plain string
        aiMessage = messageObj.content;
      } else if (messageObj.text) {
        // Fallback for legacy fields
        aiMessage = messageObj.text;
      }
    }

    return aiMessage;
  } catch (err) {
    console.error("Error fetching symptoms:", err);
    return null;
  }
};

export default getSymptoms;
