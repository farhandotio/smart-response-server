import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asynhandler.js";
import { config } from "../config/config.js";

const identifyUser = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) throw new AppError("Token not found", 401);

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
});

export default identifyUser;