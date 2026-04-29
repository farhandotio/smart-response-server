import otpGenerator from 'otp-generator';
import authModel from '../model/user.model.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendEmail.js';
import { otpTemplate } from '../email/otpTemplate.js';
import { welcomeTemplate } from '../email/welcomeTemplate.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';

export const sendOTP = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  const existing = otpStore.get(email);
  if (existing) {
    return next(new AppError('Please wait before requesting another OTP', 400));
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  console.log('OTP:', otp);

  const hashedOTP = await bcrypt.hash(otp, 10);

  otpStore.set(email, {
    otp: hashedOTP,
    username,
    password,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // auto delete after 5 min
  setTimeout(
    () => {
      otpStore.delete(email);
      otpAttempts.delete(email);
    },
    5 * 60 * 1000
  );

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - SnapSphere',
    html: otpTemplate(username, otp),
  });

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
  });
});
export const verifyOTPAndRegister = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const data = otpStore.get(email);

  if (!data) {
    otpAttempts.delete(email);
    return next(new AppError('OTP expired', 400));
  }

  const { otp: hashedOTP, username, password, expiresAt } = data;
  
  
  // expiry check
  if (Date.now() > expiresAt) {
    otpStore.delete(email);
    otpAttempts.delete(email);
    return next(new AppError('OTP expired', 400));
  }

  const isValid = await bcrypt.compare(otp.toString().trim(), hashedOTP);

  if (!isValid) {
    let attempts = otpAttempts.get(email) || 0;
    attempts += 1;

    otpAttempts.set(email, attempts);

    if (attempts >= 5) {
      return next(new AppError('Too many attempts. Try again later.', 429));
    }

    return next(new AppError('Invalid OTP', 400));
  }

  otpAttempts.delete(email);

  const existingUser = await authModel.findOne({ email });

  if (existingUser) {
    return next(new AppError('User already exists', 409));
  }

  const user = await authModel.create({
    username,
    email,
    password,
    isVerified: true,
  });

  otpStore.delete(email);

  await sendEmail({
    to: user.email,
    subject: 'Welcome to SnapSphere 🎉',
    html: welcomeTemplate(user.username),
  });

  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});
