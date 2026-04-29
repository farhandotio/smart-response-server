import express from 'express';
import identifyUser from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validator.middleawre.js';
import { becomeDeveloper, becomeClient, getMe } from '../controller/profile.controller.js';
import { developerValidation, clientValidation } from '../validator/profile.validator.js';

const profileRoutes = express.Router();

profileRoutes.get('/me', identifyUser, getMe);
profileRoutes.post(
  '/become-developer',
  identifyUser,
  developerValidation,
  validate,
  becomeDeveloper
);
profileRoutes.post('/become-client', identifyUser, clientValidation, validate, becomeClient);

export default profileRoutes;
