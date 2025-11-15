import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";
import donationRoutes from "./routes/donation.routes.js";
import connectDB from "./config/db.js";
import authMiddleware from "./middleware/auth.middleware.js";
import { getCurrentUser } from "./controllers/auth.controller.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ['OPTIONS', 'POST', 'GET', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

app.get("/api/auth/me", authMiddleware, getCurrentUser);

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});