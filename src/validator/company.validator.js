import { body } from 'express-validator';

export const companyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Max 500 characters allowed'),
];

export const inviteValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
];
