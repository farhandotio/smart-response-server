import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config.js';
import errorHandler from './middleware/error.middleware.js';

const app = express();
app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(morgan("dev"));

import authRoutes from './routes/auth.routes.js';
import otpRoutes from './routes/otp.routes.js';

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);


app.use(errorHandler);
export default app;