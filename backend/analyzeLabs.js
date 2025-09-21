import fetch from "node-fetch";

const extractLabSymptoms = `
You are given the text from a patient's **lab report**.

Your task:
1. Extract all **possible symptoms or abnormal findings** that the report suggests the patient may have.
2. Focus only on findings that directly relate to patient condition — avoid including test names, values, or medical jargon unless it directly implies a symptom.
3. The output should be strictly in JSON format only no comments or anything else should be there in output.
4. Output strictly JSON object no additional characters or texts you must reply as per the following structure:

{
  "symptoms": [
    {
      "name": "<symptom name>",
      "severity": "<severity if implied, else null>",
      "related_measure": "<lab measurement or context that supports this, else null>"
    }
  ],
  "bio-marker":[
    "name": "<bio-marker value>"
  ]
}

Guidelines:
- Be concise and factual.
- If a symptom is implied but uncertain, include it with unclear parts as null.
- Do not output diagnoses or diseases, only symptoms/abnormal findings.
- If nothing relevant is found, return {"symptoms": [], "bio-marker": []}.
`;

const analyzeSymptoms = async (labText) => {
  try {
    const prompt = `
${extractLabSymptoms}

Lab Report:
${labText}
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.3-8b-instruct:free", // or gemini-2.0-flash
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    let aiMessage = "";

    const messageObj = data.choices?.[0]?.message;

    if (messageObj) {
      if (Array.isArray(messageObj.content)) {
        aiMessage = messageObj.content
          .map((item) => (item.type === "text" ? item.text : ""))
          .join("\n");
      } else if (typeof messageObj.content === "string") {
        aiMessage = messageObj.content;
      } else if (messageObj.text) {
        aiMessage = messageObj.text;
      }
    }

    return aiMessage;
  } catch (err) {
    console.error("Error analyzing lab report symptoms:", err);
    return null;
  }
};

const analyzeLabs=analyzeSymptoms;
export default analyzeLabs;
