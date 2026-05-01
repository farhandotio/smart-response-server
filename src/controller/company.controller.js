import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import companyModel from '../model/company.model.js';
import engineerModel from '../model/engineer.model.js';
import slugify from 'slugify';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const createWorkspace = asyncHandler(async (req, res, next) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  const existingCompany = await companyModel.findOne({ ownerId: userId });
  if (existingCompany) return next(new AppError('You already own a workspace', 400));

  const slug = slugify(name, { lower: true, strict: true });

  let logoUrl = '';
  if (req.file) {
    logoUrl = await uploadToCloudinary(req.file.buffer, 'company_logos');
  }

  const company = await companyModel.create({
    name,
    slug,
    description,
    logo: logoUrl,
    ownerId: userId,
  });

  res.status(201).json({ success: true, company });
});

export const getMembers = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const company = await companyModel.findOne({ ownerId: userId });
  if (!company) return next(new AppError('Workspace not found', 404));

  const members = await engineerModel
    .find({ companyId: company._id })
    .populate('userId', 'username email role');

  res.status(200).json({ success: true, members });
});

export const getCompanyDetails = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const company = await companyModel.findOne({ slug });

  if (!company) return next(new AppError('Company not found', 404));
  res.status(200).json({ success: true, company });
});
