import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config.js';
import errorHandler from './middleware/error.middleware.js';
import { handleStripeWebhook } from './controller/wallet.controller.js';

const app = express();

app.post('/api/wallet/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(morgan('dev'));

import authRoutes from './routes/auth.routes.js';
import otpRoutes from './routes/otp.routes.js';
import profileRoutes from './routes/profile.routes.js';
import walletRoutes from './routes/wallet.routes.js';

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/wallet', walletRoutes);
app.use(errorHandler);
export default app;
