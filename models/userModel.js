import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name:{
        type: String, 
        required:[true, "Please Enter Your Name"],
        maxLength: [30, "Name Cannot exceed 30 characters"],
        minLength : [4, "Name Should  be at least 4 Characters"]
    },

    email:{
        type: String, 
        required:[true, "Please Enter Your Name"],
        unique:true,
        validator: [validator.isEmail,"Please Enter a valid Email Id"]
    },

    password:{
        type:String,
        required:[true, "Please Enter Your Password"],
        minLength: [8, "Password should be  greater than  8 Character "],
        select:false,
    },
    phone:{
        type:Number,
        minLength: [5, "Phone Number must be of 5 Digits"],
        maxLength: [15, "Phone Number must be of 15 Digits"],
    },

    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password= await bcrypt.hash(this.password , 12);
    next();
});

userSchema.methods.getJWTToken = function ()  {
    return jwt.sign({id:this._id}, process.env.JWT_SCRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}


userSchema.methods.isPasswordMatched = async function (enterdPassword){
    return await bcrypt.compare(enterdPassword, this.password);
}

export default mongoose.model( "User",userSchema);