import express from 'express';
import cookieparser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/config.js';
import errorHandler from './middleware/error.middleware.js';
import cron from 'node-cron';
import { autoMonitorLogs } from './controller/incident.controller.js';

const app = express();

app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(morgan('dev'));

cron.schedule('*/15 * * * *', () => {
  autoMonitorLogs();
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

import authRoutes from './routes/auth.routes.js';
import otpRoutes from './routes/otp.routes.js';
import profileRoutes from './routes/profile.routes.js';
import companyRoutes from './routes/company.routes.js';
import incidentRoutes from './routes/incident.routes.js';

app.use('/api/otp', otpRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/incidents', incidentRoutes);

app.use(errorHandler);
export default app;
