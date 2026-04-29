import express from 'express';
import bcrypt from 'bcrypt';
import authModel from '../model/user.model.js';
import generateToken from '../utils/token.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import { sendOTP } from './otp.controller.js';

export const sendOtpRegister = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    if (!email || !username || !password) {
        return next(new AppError("All fields are required", 400));
    }
    const existingUser = await authModel.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        return next(new AppError(
            existingUser.email === email ? "Email already exists" : "Username already exists",
            409
        ));
    }

    await sendOTP(email, username, password);
    res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email"
    });
});