import express from "express";
import identifyUser from "../middleware/auth.middleware.js";
const authRoutes = express.Router();
import { registerValidation } from "../validator/auth.validator.js";
import { sendOtpRegister, loginUser } from "../controller/auth.controller.js";
import { validate } from "../middleware/validator.middleawre.js";

authRoutes.post("/register", registerValidation, validate, sendOtpRegister);
authRoutes.post("/login", loginUser);

export default authRoutes;