import otpGenerator from 'otp-generator';
import authModel from '../model/user.model.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/sendEmail.js';
import { otpTemplate } from '../email/otpTemplate.js';
import { welcomeTemplate } from '../email/welcomeTemplate.js';
import generateToken from '../utils/token.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import inviteModel from '../model/invite.model.js';
import engineerModel from '../model/engineer.model.js';
import companyModel from '../model/company.model.js';
import { config } from '../config/config.js';

const otpStore = new Map();
const otpAttempts = new Map();

export const sendOTPForRegistration = async (email, username, password) => {
  const existing = otpStore.get(email);
  if (existing && Date.now() - existing.createdAt < 60 * 1000) {
    const timeLeft = Math.ceil((60 * 1000 - (Date.now() - existing.createdAt)) / 1000);
    throw new AppError(`Please wait ${timeLeft} seconds before requesting another OTP`, 400);
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
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  setTimeout(
    () => {
      otpStore.delete(email);
      otpAttempts.delete(email);
    },
    5 * 60 * 1000
  );

  try {
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - SIRP AI',
      html: otpTemplate(username, otp),
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    otpStore.delete(email);
    otpAttempts.delete(email);
    console.error(`Failed to send OTP email to ${email}:`, error?.message || error);
    throw new AppError('Unable to send OTP email. Please try again later.', 502);
  }
};

export const sendOTP = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;
  await sendOTPForRegistration(email, username, password);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
  });
});
export const verifyOTPAndRegister = asyncHandler(async (req, res, next) => {
  const { email, otp, token: inviteToken } = req.body;

  const data = otpStore.get(email);
  if (!data) return next(new AppError('OTP expired', 400));

  const { otp: hashedOTP, username, password, expiresAt } = data;

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

  let role = 'company_admin';
  let companyIdToJoin = null;

  if (inviteToken) {
    const invite = await inviteModel.findOne({ token: inviteToken, email, status: 'pending' });
    if (invite) {
      role = 'engineer';
      companyIdToJoin = invite.companyId;
    }
  }

  const user = await authModel.create({
    username,
    email,
    password,
    role,
    isVerified: true,
  });

  if (role === 'engineer' && companyIdToJoin) {
    await engineerModel.create({
      userId: user._id,
      companyId: companyIdToJoin,
      availabilityStatus: 'online',
    });

    await inviteModel.findOneAndUpdate({ token: inviteToken }, { status: 'accepted' });
  }

  otpStore.delete(email);

  await sendEmail({
    to: user.email,
    subject: 'Welcome to SnapSphere',
    html: welcomeTemplate(user.username),
  });

  const token = generateToken(user._id, user.role, user.username, user.email);

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
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
      role: user.role,
    },
  });
});
