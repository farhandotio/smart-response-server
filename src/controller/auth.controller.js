import express from 'express';
import bcrypt from 'bcrypt';
import authModel from '../model/user.model.js';
import engineerModel from '../model/engineer.model.js';
import generateToken from '../utils/token.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import { sendOTPForRegistration } from './otp.controller.js';
import { config } from '../config/config.js';

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
    message: 'OTP sent successfully to your email',
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return next(new AppError('Username/email and password are required', 400));
  }

  const user = await authModel
    .findOne({
      $or: [{ email: identifier }, { username: identifier }],
    })
    .select('+password');

  if (!user) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.isVerified) {
    return next(new AppError('Please verify your email before logging in', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  const token = generateToken(user._id, user.role, user.username, user.email);
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role || null,
    },
  });
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie('token', null, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
export const updateRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const userId = req.user.id;

  if (!['engineer', 'company_admin'].includes(role)) {
    return next(new AppError('Invalid role selection', 400));
  }

  const user = await authModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError('User not found', 404));
  
  if (role === 'engineer') {
    const existingProfile = await engineerModel.findOne({ userId: user._id });
    if (!existingProfile) {
      await engineerModel.create({ userId: user._id, availabilityStatus: 'online' });
    }
  }

  // Generate new token with updated role
  const token = generateToken(user._id, user.role, user.username, user.email);
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});
