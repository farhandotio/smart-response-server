import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import authModel from '../model/user.model.js';
import engineerModel from '../model/engineer.model.js';
import companyModel from '../model/company.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import slugify from 'slugify';

export const getMe = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await authModel.findById(userId).select('-password');
  if (!user) return next(new AppError('User not found', 404));

  let profile = null;
  if (user.role === 'engineer') {
    profile = await engineerModel.findOne({ userId });
  } else if (user.role === 'company_admin') {
    profile = await companyModel.findOne({ ownerId: userId });
  }

  res.status(200).json({ success: true, user, profile });
});

export const setupEngineerProfile = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'engineer') {
    return next(new AppError('Only engineers can set up this profile', 403));
  }
  const userId = req.user.id;
  const { expertise, seniority, bio } = req.body;

  let pictureUrl = '';
  if (req.file) {
    pictureUrl = await uploadToCloudinary(req.file.buffer, 'engineer_pics');
  }

  let profile = await engineerModel.findOne({ userId });

  if (profile) {
    profile.expertise = expertise || profile.expertise;
    profile.seniority = seniority || profile.seniority;
    profile.bio = bio || profile.bio;
    if (pictureUrl) profile.picture = pictureUrl;
    await profile.save();
  } else {
    profile = await engineerModel.create({
      userId,
      expertise,
      seniority,
      bio,
      picture: pictureUrl,
      availabilityStatus: 'online',
    });
  }

  res.status(200).json({ success: true, profile });
});
