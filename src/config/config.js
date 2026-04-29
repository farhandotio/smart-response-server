import dotenv from 'dotenv';
import { Resend } from "resend";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables")
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
}
