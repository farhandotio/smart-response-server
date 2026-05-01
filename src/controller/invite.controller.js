import crypto from 'crypto';
import inviteModel from '../model/invite.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import companyModel from '../model/company.model.js';
import { config } from '../config/config.js';

export const inviteEngineer = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const adminId = req.user.id;

  const company = await companyModel.findOne({ ownerId: adminId });
  if (!company) return next(new AppError("You don't have a workspace to invite someone.", 404));

  const token = crypto.randomBytes(32).toString('hex');

  await inviteModel.create({
    email,
    companyId: company._id,
    token,
  });

  const inviteLink = `${config.CLIENT_URL}/register?token=${token}&email=${email}`;

  await sendEmail({
    to: email,
    subject: `Join ${company.name} on Smart Response`,
    html: `<h3>You are invited to join ${company.name} as an Engineer.</h3>
           <p>Click the link below to join:</p>
           <a href="${inviteLink}">Accept Invitation</a>`,
  });

  console.log(inviteLink);
  res.status(200).json({ success: true, message: 'Invitation sent!' });
});
