import jwt from "jsonwebtoken"

const generatePatientAccessToken=(email)=>{
    const accessToken=jwt.sign({
        email: email
    }, process.env.JWT_SECRET, 
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
    return accessToken;
}

const generateDoctorAccessToken=(email)=>{
    const accessToken=jwt.sign({
        email: email
    }, process.env.JWT_SECRET, 
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
    return accessToken;
}

const validateAccessToken=(req)=>{
    try{
        const accessToken=req.cookies?.accessToken;
        if(!accessToken)
        {
            return null;
        }
        const validatedUser=jwt.verify(accessToken, process.env.JWT_SECRET);
        return validatedUser;
    }
    catch(error)
    {
        console.log(error);
        return null;
    }
}

const patientAuth=async(req, res, next)=>{
    try{
        const patient=validateAccessToken(req);
        req.patient= req.patient || {};
        req.patient.email=patient.email;
        next();
    }
    catch(error)
    {
        res.sendStatus(400);
    }
}

export {validateAccessToken, generateDoctorAccessToken, generatePatientAccessToken, patientAuth}
