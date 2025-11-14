import express from "express";
import { registerUser, loginUser, listAllNGOs } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/register", registerUser);
router.get("/ngos",listAllNGOs);
router.post("/login", loginUser);

export default router;

