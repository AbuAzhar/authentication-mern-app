import cors from 'cors';
import dotenv from "dotenv";
import express from "express";
import { mongoConnection } from "./config/database.js";
// import User from "./models/User.js"; // Import User model
import bodyParser from "body-parser";
import userSchema from './models/userModel.js';
dotenv.config({ path: "config/config.env" });

const app = express();
const PORT = process.env.PORT || 5000;

mongoConnection();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); 

app.post("/api/v1/register", async (req, res) => { 
    try {
        const { name, email, password, phone } = req.body;
        const user = await userSchema.create({ name, email, password, phone });
        const token = user.getJWTToken();
        res.status(201).json({
            success: true,
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
});

app.post("/api/v1/login", async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) return res.status(400).send("Please provide an email and a password");
    
    const user = await userSchema.findOne({ email }).select('+password');
    if(!user) return res.status(400).send("Email or Password is incorrect.");

    const isEqual = await user.isPasswordMatched(password);
      
      if (!isEqual) return res.status(400).send("Email or Password is Incorrect.");
  
      const token = user.getJWTToken();
      res.status(200).json({
          token,
          username: user.name,
          id: user._id,
      })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
