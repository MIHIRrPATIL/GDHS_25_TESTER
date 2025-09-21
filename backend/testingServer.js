// server.js
import express from "express";

// If Node < 18, uncomment next line after installing node-fetch
// import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get("/run-diagnosis", async (req, res) => {
  try {
    // First fetch: patient details
    const patientResponse = await fetch("http://localhost:3000/getPatientDetails");
    const patientData = await patientResponse.json();
    console.log("Fetched patient data:", patientData);

    // Second fetch: send data to diagnose service
    const diagnoseResponse = await fetch("http://10.160.85.14:5001/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData)
    });

    const finalJson = await diagnoseResponse.json();
    console.log("Diagnosis response:", finalJson);

    res.json(finalJson);
  } catch (error) {
    console.error("Error in pipeline:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
