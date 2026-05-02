import express from 'express';
import identifyUser from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import {
  createWorkspace,
  getMembers,
  getCompanyDetails,
  getInvitations,
  acceptInvitation,
  addLogSource
} from '../controller/company.controller.js';
import { inviteEngineer } from '../controller/invite.controller.js';
import { companyValidation, inviteValidation } from '../validator/company.validator.js';
import { validate } from '../middleware/validator.middleware.js';

const companyRoutes = express.Router();

companyRoutes.post(
  '/create',
  identifyUser,
  upload.single('image'),
  companyValidation,
  validate,
  createWorkspace
);
companyRoutes.get('/members', identifyUser, getMembers);
companyRoutes.get('/invitations', identifyUser, getInvitations);
companyRoutes.post('/accept-invitation', identifyUser, acceptInvitation);
companyRoutes.post('/invite', identifyUser, inviteValidation, validate, inviteEngineer);
companyRoutes.post('/log-source', identifyUser, addLogSource);
companyRoutes.get('/:slug', getCompanyDetails);

export default companyRoutes;
