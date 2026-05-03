import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import authModel from '../model/user.model.js';
import engineerModel from '../model/engineer.model.js';
import companyModel from '../model/company.model.js';
import inviteModel from '../model/invite.model.js';
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
  console.log('Setup Profile Request:', { userId: req.user.id, role: req.user.role });
  if (req.user.role !== 'engineer') {
    return next(new AppError(`Only engineers can set up this profile (Current role: ${req.user.role})`, 403));
  }
  const userId = req.user.id;
  const { expertise, seniority, bio, inviteToken, companyId: providedCompanyId } = req.body;

  let companyId = providedCompanyId || null;
  if (inviteToken) {
    const invite = await inviteModel.findOne({ token: inviteToken, email: req.user.email, status: 'pending' });
    if (invite) {
      companyId = invite.companyId;
      invite.status = 'accepted';
      await invite.save();
    }
  } else if (companyId) {
    const company = await companyModel.findById(companyId);
    if (!company) {
      return next(new AppError('Selected workspace not found', 404));
    }
  }

  let pictureUrl = '';
  if (req.file) {
    pictureUrl = await uploadToCloudinary(req.file.buffer, 'engineer_pics');
  }

  let profile = await engineerModel.findOne({ userId });

  let expertiseArray = expertise;
  if (typeof expertise === 'string') {
    try {
      expertiseArray = JSON.parse(expertise);
    } catch (e) {
      expertiseArray = expertise.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  if (profile) {
    profile.expertise = expertiseArray || profile.expertise;
    profile.seniority = seniority || profile.seniority;
    profile.bio = bio || profile.bio;
    if (companyId) profile.companyId = companyId;
    if (pictureUrl) profile.picture = pictureUrl;
    await profile.save();
  } else {
    profile = await engineerModel.create({
      userId,
      expertise: expertiseArray,
      seniority,
      bio,
      companyId,
      picture: pictureUrl,
      availabilityStatus: 'online',
    });
  }

  res.status(200).json({ success: true, profile });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { username, name, description, bio, seniority, expertise } = req.body;

  // Update username if provided
  if (username) {
    const existingUser = await authModel.findOne({ username, _id: { $ne: userId } });
    if (existingUser) return next(new AppError('Username already taken', 400));
    await authModel.findByIdAndUpdate(userId, { username });
  }

  let pictureUrl = '';
  if (req.file) {
    pictureUrl = await uploadToCloudinary(req.file.buffer, role === 'company_admin' ? 'company_logos' : 'engineer_pics');
  }

  let profile = null;

  if (role === 'company_admin') {
    profile = await companyModel.findOne({ ownerId: userId });
    if (profile) {
      if (name) profile.name = name;
      if (description) profile.description = description;
      if (pictureUrl) profile.logo = pictureUrl;
      await profile.save();
    }
  } else if (role === 'engineer') {
    profile = await engineerModel.findOne({ userId });
    if (profile) {
      if (bio) profile.bio = bio;
      if (seniority) profile.seniority = seniority;
      if (pictureUrl) profile.picture = pictureUrl;
      
      if (expertise) {
        try {
          profile.expertise = JSON.parse(expertise);
        } catch (e) {
          profile.expertise = expertise.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      await profile.save();
    }
  }

  res.status(200).json({ success: true, message: 'Profile updated successfully', profile });
});
