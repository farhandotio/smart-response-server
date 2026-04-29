import express from 'express';
import bcrypt from 'bcrypt';
import authModel from '../model/user.model.js';
import generateToken from '../utils/token.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import { sendOTPForRegistration } from './otp.controller.js';

export const sendOtpRegister = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!email || !username || !password) {
    return next(new AppError('All fields are required', 400));
  }
  const existingUser = await authModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return next(
      new AppError(
        existingUser.email === email ? 'Email already exists' : 'Username already exists',
        409
      )
    );
  }

    await sendOTPForRegistration(email, username, password);
    res.status(200).json({
        success: true,
        message: "OTP sent successfully to your email"
    });
});

export const loginUser = asyncHandler(async (req, res, next) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return next(new AppError("Username/email and password are required", 400));
    }

    const user = await authModel.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
        return next(new AppError("Invalid credentials", 401));
    }

    if (!user.isVerified) {
        return next(new AppError("Please verify your email before logging in", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError("Invalid credentials", 401));
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role || null
        }
    });
});
