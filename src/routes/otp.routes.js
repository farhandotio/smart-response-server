import express from 'express';
import { verifyOTPAndRegister } from '../controller/otp.controller.js';

const otpRoutes = express.Router();

otpRoutes.post('/verify-otp', verifyOTPAndRegister);

export default otpRoutes;
