import crypto from 'crypto';
import inviteModel from '../model/invite.model.js';
import { sendEmail } from '../utils/sendEmail.js';
import { inviteTemplate } from '../email/inviteTemplate.js';
import asyncHandler from '../utils/asynhandler.js';
import AppError from '../utils/AppError.js';
import companyModel from '../model/company.model.js';
import authModel from '../model/user.model.js';
import engineerModel from '../model/engineer.model.js';
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
    subject: `Invitation to join ${company.name} on SIRP`,
    html: inviteTemplate(company.name, inviteLink),
  });

  // Also add an in-app notification if the engineer is already registered
  const engineerUser = await authModel.findOne({ email });
  if (engineerUser) {
    const engineerProfile = await engineerModel.findOne({ userId: engineerUser._id });
    if (engineerProfile) {
      engineerProfile.notifications.push({
        type: 'invitation',
        message: `You have been invited to join ${company.name}`,
        link: inviteLink,
      });
      await engineerProfile.save();
    }
  }

  console.log(inviteLink);
  res.status(200).json({ success: true, message: 'Invitation sent!' });
});
