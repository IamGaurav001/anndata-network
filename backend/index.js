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

if (process.env.NODE_ENV === 'production') {
    app.use(cors({
        origin: ['https://anndata-network.vercel.app', process.env.FRONTEND_URL],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    }));
} else {
    app.use(cors({ origin: true, credentials: true }));
}

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.get("/api/auth/me", authMiddleware, getCurrentUser);

app.get("/", (req, res) => {
    res.json({ message: "API is running..." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});