import express from 'express';
import identifyUser from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleware.js';
import { getMe, setupEngineerProfile } from '../controller/profile.controller.js';
import { engineerProfileValidation } from '../validator/profile.validator.js';
import { upload } from '../middleware/multer.middleware.js';

const profileRoutes = express.Router();

profileRoutes.get('/me', identifyUser, getMe);

profileRoutes.post(
  '/setup-engineer',
  identifyUser,
  upload.single('image'),
  engineerProfileValidation,
  validate,
  setupEngineerProfile
);

export default profileRoutes;
