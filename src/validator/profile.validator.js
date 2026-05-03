import { body } from 'express-validator';

export const engineerProfileValidation = [
  body('expertise')
    .custom((value) => {
      let expertise = value;
      if (typeof value === 'string') {
        try {
          expertise = JSON.parse(value);
        } catch (e) {
          expertise = value.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
      if (!Array.isArray(expertise) || expertise.length === 0) {
        throw new Error('At least one expertise tag is required');
      }
      return true;
    }),
  body('seniority')
    .isIn(['junior', 'mid', 'senior', 'lead'])
    .withMessage('Invalid seniority level'),
  body('bio').optional().isLength({ min: 10 }).withMessage('Bio should be descriptive'),
  body('companyId').optional().isMongoId().withMessage('Invalid company ID'),
];
