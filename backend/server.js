import express from "express"
import dotenv from "dotenv"
import getSymptoms from "./prompts.js"
import {PrismaClient} from "@prisma/client"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import { generateDoctorAccessToken, generatePatientAccessToken, validateAccessToken } from "./auth.js"

dotenv.config()
const app=express()
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
const prisma=new PrismaClient()

const auth=async (req, res, next)=>{
    const accessToken=req.cookies.accessToken;
    if(!accessToken) return res.status(401).json({error: "Unauthorized"});
    const isValid=await validateAccessToken(req);
    if(!isValid) return res.status(401).json({error: "Unauthorized"});
    req.patient={};
    req.patient.email=isValid.email;
    next();
}

app.get("/getPatientEmail", auth, async(req, res)=>{
    const email=req.patient.email;
    if(!email || email.trim()==="") return res.status(400).json({error: "Email is required."}); 
    const patient=await prisma.patient.findFirst({
        where:{
            email: email,
        }
    })
    if(!patient) return res.status(404).json({error: "Patient not found."});
    return res.status(200).json({id: patient.id});
})

app.post("/getSymptomsFromDoctor", async(req, res)=>{
    const patient=req.body.patient
    const doctor=req.body.doctor
    let symptoms=await getSymptoms(doctor, patient);
    symptoms=JSON.parse(symptoms);
    return res.status(200).json(symptoms);
})

app.post("/getSymptomsFromChat", async(req, res)=>{
    const patient=req.body.patient
    const doctor=req.body.chat
    let symptoms=await getSymptoms(doctor, patient);
    symptoms=JSON.parse(symptoms);
    return res.status(200).json(symptoms);
})

app.post("/patient/signUp", async (req, res)=>{
    const email=req.body.email;
    const password=req.body.password;
    const firstName=req.body.firstName;
    const lastName=req.body.lastName;
    let age=req.body.age;
    age=parseInt(age);
    let height=req.body.height;
    height=parseInt(height);
    const occupation=req.body.occupation;
    const gender=req.body.gender;
    const isSmoker=req.body.isSmoker;
    const isDrunkard=req.body.isDrunkard;
    const exercise=req.body.exercise;
    const chronicDisease=req.body.chronicDiseases;
    const allergies=req.body.allergies;
    const currentMeds=req.body.currentMeds;
    const familyHistory=req.body.familyHistory;
    const emergencyContactPhone=req.body.emergencyContactPhone;
    const emergencyContactName=req.body.emergencyContactName;
    let weight=req.body.weight;
    weight=parseInt(weight);

    let array=[
        email,
        password,
        firstName,
        lastName,
        height,
        weight,
        age,
        occupation,
        isSmoker,
        isDrunkard,
        exercise,
        chronicDisease,
        allergies,
        currentMeds,
        familyHistory,
        emergencyContactPhone,
        emergencyContactName
    ]

    if(!email || !password)
    {
        return res.status(400).json({
            error: "Wrong credentials"
        })
    }

    const hasMissingField = array.some(
        field =>
        field === null ||
        field === undefined ||
        (typeof field === "string" && field.trim() === "")
    );

    if(hasMissingField)
    {
        return res.status(400).json({error: "Fill all the fields."})
    }

    const patient=await prisma.patient.create({
        data: {
            email:email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            age: age,
            occupation: occupation,
            height: height,
            weight: weight,
            isSmoker: isSmoker,
            isDrunkard: isDrunkard,
            exercise: exercise,
            chronicDisease: chronicDisease,
            allergies: allergies,
            currentMeds: currentMeds,
            familyHistory: familyHistory
        }
    })
    const accessToken=generatePatientAccessToken(email);
    res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
    })
    return res.sendStatus(200);
})

app.post("/patient/logIn", async(req, res)=>{
    const email=req.body.email;
    const password=req.body.password;

    const user=await prisma.patient.findFirst({
        where:{
            email: email,
        }
    })

    if(!user || user.password!==password) return res.status(400).json({error: "Wrong credentials."});
    const accessToken=generatePatientAccessToken(email)
    res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
    })
    return res.sendStatus(200);
})

app.post("/doctor/signUp", async(req, res)=>{
    console.log(req.body);
    const email=req.body.email;
    const password=req.body.password;
    const firstName=req.body.firstName;
    const lastName=req.body.lastName;

    if (
        !email || email.trim() === "" ||
        !password || password.trim() === "" ||
        !firstName || firstName.trim() === "" ||
        !lastName || lastName.trim() === ""
        ) {
        return res.status(400).json({ error: "Enter all fields." });
    }

    const doctor=await prisma.doctor.create({
        data:{
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        }
    })

    const accessToken=generateDoctorAccessToken(email);
    res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
    })
    return res.status(200).json({OK: true});
})

app.post("/doctor/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || email.trim() === "" || !password || password.trim() === "") {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Check if doctor exists
    const doctor = await prisma.doctor.findFirst({
      where: { email: email }
    });

    if (!doctor) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password (plain check for now; bcrypt recommended in real apps)
    if (doctor.password !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate access token
    const accessToken = generateDoctorAccessToken(email);

    // Set cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // ⚠️ change to true in production with HTTPS
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});


app.listen(3000, ()=>{
    console.log("The server is running.")
})
