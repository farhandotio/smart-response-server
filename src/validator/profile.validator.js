import { body } from 'express-validator';

export const engineerProfileValidation = [
  body('expertise').isArray({ min: 1 }).withMessage('At least one expertise tag is required'),
  body('seniority')
    .isIn(['junior', 'mid', 'senior', 'lead'])
    .withMessage('Invalid seniority level'),
  body('bio').optional().isLength({ min: 10 }).withMessage('Bio should be descriptive'),
];
