import { body } from 'express-validator';

export const developerValidation = [
  body('experienceYears').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('techStack').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('rateMin').isFloat({ min: 0 }).withMessage('Minimum rate is required'),
  body('rateMax').custom((value, { req }) => {
    if (parseFloat(value) < parseFloat(req.body.rateMin)) {
      throw new Error('Max rate cannot be less than Min rate');
    }
    return true;
  }),
  body('portfolioLink').optional().isURL().withMessage('Invalid portfolio URL'),
];

export const clientValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('companyDesc').optional().isLength({ max: 500 }).withMessage('Description too long'),
];
