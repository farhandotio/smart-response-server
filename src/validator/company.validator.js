import { body } from 'express-validator';

export const companyValidation = [
  body('name').trim().notEmpty().withMessage('Company name is required'),

  body('description').optional().isLength({ max: 500 }).withMessage('Max 500 characters allowed'),

  body('logSources')
    .customSanitizer((value) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    })
    .isArray({ min: 1 })
    .withMessage('At least one log source is required as an array')
    .custom((sources) => {
      if (!Array.isArray(sources)) return false;

      for (const source of sources) {
        if (!source.sourceName || !source.logUrl || !source.serviceType) {
          throw new Error('Each log source must have sourceName, logUrl, and serviceType');
        }
        if (!['frontend', 'backend', 'database'].includes(source.serviceType)) {
          throw new Error('serviceType must be one of frontend, backend, or database');
        }
      }
      return true;
    }),
];

export const inviteValidation = [
  body('email').trim().normalizeEmail().isEmail().withMessage('Valid email is required'),
];
