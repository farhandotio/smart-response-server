import express from 'express';
import identifyUser from '../middleware/auth.middleware.js';
import { createCheckoutSession } from '../controller/wallet.controller.js';
import { depositValidation } from '../validator/wallet.validator.js';
import { validate } from '../middleware/validator.middleawre.js';

const walletRoutes = express.Router();

walletRoutes.post(
  '/create-checkout-session',
  identifyUser,
  depositValidation,
  validate,
  createCheckoutSession
);

export default walletRoutes;
