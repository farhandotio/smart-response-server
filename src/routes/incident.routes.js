import express from 'express';
import {
  autoMonitorLogs,
  getAllIncidents,
  updateIncidentStatus,
  getIncidentDetails,
  assignEngineer,
  unassignEngineer,
} from '../controller/incident.controller.js';
import identifyUser from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';

const incidentRoutes = express.Router();

incidentRoutes.get(
  '/monitor-all',
  identifyUser,
  authorize('platform_admin', 'company_admin'),
  autoMonitorLogs
);

incidentRoutes.use(identifyUser);

incidentRoutes.get(
  '/all',
  authorize('company_admin', 'engineer', 'platform_admin'),
  getAllIncidents
);

incidentRoutes.get('/:id', authorize('company_admin', 'engineer'), getIncidentDetails);

incidentRoutes.patch('/:id/status', authorize('engineer', 'company_admin'), updateIncidentStatus);
incidentRoutes.post('/:id/assign', authorize('engineer', 'company_admin'), assignEngineer);
incidentRoutes.post('/:id/unassign', authorize('company_admin'), unassignEngineer);

export default incidentRoutes;
