import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import authModel from '../model/user.model.js';
import developerModel from '../model/developer.model.js';
import clientModel from '../model/client.model.js';

export const getMe = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const user = await authModel.findById(userId).select('-password');
  if (!user) return next(new AppError('User not found', 404));

  let profile = null;

  if (user.role === 'developer') {
    profile = await developerModel.findOne({ userId });
  } else if (user.role === 'client') {
    profile = await clientModel.findOne({ userId });
  }

  res.status(200).json({
    success: true,
    user,
    profile,
  });
});

export const becomeDeveloper = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { experienceYears, techStack, rateMin, rateMax, bio, portfolioLink } = req.body;

  const user = await authModel.findById(userId);

  if (user.role === 'developer') {
    return next(new AppError('You are already a Developer.', 400));
  }

  if (user.role === 'client') {
    return next(
      new AppError('A Client cannot become a Developer. Please use a different account.', 403)
    );
  }

  const existingProfile = await developerModel.findOne({ userId });
  if (existingProfile) return next(new AppError('Developer profile already exists', 400));

  user.role = 'developer';
  await user.save();

  const profile = await developerModel.create({
    userId,
    experienceYears,
    techStack,
    rateMin,
    rateMax,
    bio,
    portfolioLink,
  });

  res.status(201).json({
    success: true,
    message: 'Developer profile created successfully',
    user: { id: user._id, username: user.username, role: user.role },
    profile,
  });
});

export const becomeClient = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { companyName, companyDesc } = req.body;

  const user = await authModel.findById(userId);

  if (user.role === 'client') {
    return next(new AppError('You are already a Client.', 400));
  }

  if (user.role === 'developer') {
    return next(
      new AppError('A Developer cannot become a Client. Please use a different account.', 403)
    );
  }

  const existingProfile = await clientModel.findOne({ userId });
  if (existingProfile) return next(new AppError('Client profile already exists', 400));

  user.role = 'client';
  await user.save();

  const profile = await clientModel.create({
    userId,
    companyName,
    companyDesc,
  });

  res.status(201).json({
    success: true,
    message: 'Client profile created successfully',
    user: { id: user._id, username: user.username, role: user.role },
    profile,
  });
});
