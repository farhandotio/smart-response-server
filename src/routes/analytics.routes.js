import express from 'express';
import identifyUser from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';
import { getCompanyAnalytics, getEngineerAnalytics } from '../controller/analytics.controller.js';

const analyticsRoutes = express.Router();

analyticsRoutes.use(identifyUser);

analyticsRoutes.get('/company', authorize('company_admin'), getCompanyAnalytics);
analyticsRoutes.get('/engineer', authorize('engineer'), getEngineerAnalytics);

export default analyticsRoutes;
