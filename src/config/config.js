import 'dotenv/config';
import { Resend } from 'resend';

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'jwt_secret_key',
  MONGO_URI: process.env.MONGO_URI,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
