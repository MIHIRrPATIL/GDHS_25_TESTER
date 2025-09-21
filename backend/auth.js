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

export {validateAccessToken, generateDoctorAccessToken, generatePatientAccessToken}
