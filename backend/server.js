import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import { connectDB } from "./lib/db.js";
const app = express();
const port = process.env.PORT;

app.use(cors({
    origin:[
        "http://localhost:5173",
        "https://chatnest-eta.vercel.app/",
        
        ],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);




app.listen(port,()=>{
    console.log(`server is running on ${port}`);
    connectDB();
});