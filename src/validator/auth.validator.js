import { body } from "express-validator";

export const registerValidation = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 20 }).withMessage("Username must be 3-20 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Only letters, numbers, underscore allowed"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail().withMessage("Valid email required"),

  body("password")
    .trim()
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number")
];