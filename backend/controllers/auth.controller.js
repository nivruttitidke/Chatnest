import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export async function signup(req,res){
const {email, password, fullName} = req.body;
try {
    if(!fullName || !email || !password) {
        return res.status(400).json({message: "All field are required"});
    }
    
    if(password.length < 6){
        return res.status(400).json({message:"password must be at least 6 characters"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({message:"email is alredy exist , plz login"});
   }

   const idx = Math.floor(Math.random() * 100) +1;
   const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`;
    const newUser = await User.create({
        email,
        password,
        fullName,
        profilepic:randomAvatar,
    })
     
    try {
         await upsertStreamUser({
        id:newUser._id.toString(),
        name:newUser.fullName,
        image:newUser.profilepic || "",
     })
     console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
        console.log("error by Stream user",error);
    }

    const token = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET_KEY,{
        expiresIn:"7d",     
    })

    res.cookie("jwt",token,{
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
    sameSite:"strict",
    secure:process.env.NODE_ENV === "production",
    })
   
    res.status(201).json({success:true, user:newUser});


} catch (error) {
    console.log("error in signup controller", error);
    res.status(500).json({message:"internal server error signup"});
}

};

export async function login(req,res){
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"all filed are required"});
           }
            const user = await User.findOne({email});
            if(!user){ return res.status(404).json({message:"plz signup  "});
             }
            const isPasswordCorrect =  await user.matchPassword(password);
           if(!isPasswordCorrect){
            return res.status(400).json({message:"passwoed is incorect"});
           }
           const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY,{
            expiresIn:"7d",     
        })

          res.cookie("jwt",token,{
          maxAge:7 * 24 * 60 * 60 * 1000,
          httpOnly:true,
          sameSite:"strict",
          secure:process.env.NODE_ENV === "production",
            })
             res.status(200).json({success:true , user})
        
    } catch (error) {
        console.log("error in login", error.message);
        res.status(500).json({message:"internal server error login"});
    }
};

export async function logout(req,res){
    res.clearCookie("jwt");
    res.status(200).json({success:true, message:"logout successful"});
};

export async function onboard(req,res){
   try {
    const userid = req.user._id;
    const {fullName,bio, nativeLanguage,learningLanguage,location} =req.body;
    if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
        return res.status(400).json({message:"all field are required",
            missingField: [
                !fullName && "fullName",
                !bio && "bio",
                !nativeLanguage && "nativeLanguage",
                !learningLanguage && "learningLanguage",
                !location && "location",
            ],
        });
    }
     const updateUser= await User.findByIdAndUpdate(userid,{
        ...req.body,
        isOnboarded:true,
      },{new:true})
     if(!updateUser){
        return res.status(400).json({message:"user not found"})
     }
        
    try {
         await upsertStreamUser({
        id:updateUser._id.toString(),
        name:updateUser.fullName,
        image:updateUser.profilepic || "",
     })
     console.log(`user is updated on stream for ${updateUser,fullName}`);
    } catch (error) {
        console.log("user updated on onboard", error);
        res.status(500).json({message:"internal server error- onboard"});
    }

        res.status(200).json({success:true, user:updateUser});
     
   } catch (error) {
    console.log("onboarding error",error);
    res.status(500).json({message:"internal server error"});
   }
};