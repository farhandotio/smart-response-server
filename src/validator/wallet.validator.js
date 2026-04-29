import { body } from 'express-validator';

export const depositValidation = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 1 })
    .withMessage('Minimum deposit amount is $1')
    .custom((value) => {
      if (value > 10000) {
        throw new Error('Maximum deposit limit is $10,000');
      }
      return true;
    }),
];
