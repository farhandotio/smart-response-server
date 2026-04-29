import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import authModel from '../model/user.model.js';
import developerModel from '../model/developer.model.js';
import clientModel from '../model/client.model.js';

export const becomeDeveloper = asyncHandler(async (req, res, next) => {
  const { experienceYears, techStack, rateMin, rateMax, bio, portfolioLink } = req.body;
  const userId = req.user.id; 

  const existingProfile = await developerModel.findOne({ userId });
  if (existingProfile) return next(new AppError('Developer profile already exists', 400));

  await authModel.findByIdAndUpdate(userId, { role: 'developer' });

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
    user: await authModel.findById(userId).select('-password'),
    profile,
  });
});

export const becomeClient = asyncHandler(async (req, res, next) => {
  const { companyName, companyDesc } = req.body;
  const userId = req.user.id;

  const existingProfile = await clientModel.findOne({ userId });
  if (existingProfile) return next(new AppError('Client profile already exists', 400));

  await authModel.findByIdAndUpdate(userId, { role: 'client' });

  const profile = await clientModel.create({
    userId,
    companyName,
    companyDesc,
  });

  res.status(201).json({
    success: true,
    message: 'Client profile created successfully',
    user: await authModel.findById(userId).select('-password'),
    profile,
  });
});
