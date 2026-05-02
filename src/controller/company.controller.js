import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import companyModel from '../model/company.model.js';
import engineerModel from '../model/engineer.model.js';
import inviteModel from '../model/invite.model.js';
import slugify from 'slugify';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const createWorkspace = asyncHandler(async (req, res, next) => {
  const { name, description, logSources } = req.body;
  const userId = req.user.id;

  const existingCompany = await companyModel.findOne({ ownerId: userId });
  if (existingCompany) return next(new AppError('You already own a workspace', 400));

  const slug = slugify(name, { lower: true, strict: true });

  let logoUrl = '';
  if (req.file) {
    logoUrl = await uploadToCloudinary(req.file.buffer, 'company_logos');
  }

  let logSourcesArray = logSources;
  if (typeof logSources === 'string') {
    try {
      logSourcesArray = JSON.parse(logSources);
    } catch (e) {
      logSourcesArray = [];
    }
  }

  const company = await companyModel.create({
    name,
    slug,
    description,
    logo: logoUrl,
    ownerId: userId,
    logSources: logSourcesArray,
  });

  res.status(201).json({ success: true, company });
});

export const getMembers = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let company;
  if (userRole === 'company_admin') {
    company = await companyModel.findOne({ ownerId: userId });
  } else {
    const profile = await engineerModel.findOne({ userId });
    if (profile) {
      company = await companyModel.findById(profile.companyId).populate('ownerId', 'username email');
    }
  }
  if (!company) {
    return res.status(200).json({ success: true, company: null, members: [] });
  }

  const members = await engineerModel
    .find({ companyId: company._id })
    .populate('userId', 'username email role');

  res.status(200).json({ 
    success: true, 
    company,
    leader: userRole === 'company_admin' ? req.user : company.ownerId,
    members 
  });
});

export const getInvitations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'company_admin') {
    const company = await companyModel.findOne({ ownerId: userId });
    if (!company) return res.status(200).json({ success: true, invitations: [] });
    const invitations = await inviteModel.find({ companyId: company._id }).sort('-createdAt');
    return res.status(200).json({ success: true, invitations });
  } else {
    const invitations = await inviteModel.find({ email: req.user.email, status: 'pending' }).populate('companyId', 'name description');
    return res.status(200).json({ success: true, invitations });
  }
});

export const acceptInvitation = asyncHandler(async (req, res, next) => {
  const { inviteId } = req.body;
  const userId = req.user.id;

  const invite = await inviteModel.findById(inviteId);
  if (!invite) return next(new AppError('Invitation not found', 404));
  if (invite.status !== 'pending') return next(new AppError('Invitation already processed', 400));
  if (invite.email !== req.user.email) return next(new AppError('This invitation is not for you', 403));

  let profile = await engineerModel.findOne({ userId });
  if (!profile) {
    profile = await engineerModel.create({
      userId,
      companyId: invite.companyId,
      availabilityStatus: 'online',
    });
  } else {
    profile.companyId = invite.companyId;
    await profile.save();
  }

  invite.status = 'accepted';
  await invite.save();

  res.status(200).json({ success: true, message: 'Invitation accepted! Welcome to the team.', profile });
});

export const getCompanyDetails = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const company = await companyModel.findOne({ slug });

  if (!company) return next(new AppError('Company not found', 404));
  res.status(200).json({ success: true, company });
});
