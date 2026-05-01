import incidentModel from '../model/incident.model.js';
import companyModel from '../model/company.model.js';
import engineerModel from '../model/engineer.model.js';
import { analyzeLogWithAI } from '../utils/aiDiagnosis.js';
import { sendEmail } from '../utils/sendEmail.js';
import { incidentAlertTemplate } from '../email/incidentAlert.js';
import asyncHandler from '../utils/asynhandler.js';
import axios from 'axios';
import { getIO } from '../config/socket.js';

export const autoMonitorLogs = asyncHandler(async (req, res) => {
  const companies = await companyModel
    .find({ 'logSources.0': { $exists: true } })
    .populate('ownerId');

  for (const company of companies) {
    for (const source of company.logSources) {
      let diagnosis = null;
      let isServerDown = false;

      try {
        const response = await axios.get(source.logUrl, { timeout: 8000 });
        const logData =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

        diagnosis = await analyzeLogWithAI(logData.slice(0, 5000));
      } catch (err) {
        isServerDown = true;
        let cleanUrl = source.logUrl;
        try {
          const urlObj = new URL(source.logUrl);
          cleanUrl = urlObj.host;
        } catch (e) {
          cleanUrl = source.logUrl;
        }

        diagnosis = {
          isIssue: true,
          title: `Service Down: ${source.sourceName}`,
          description: `The monitoring system detected that the service at ${cleanUrl} is unreachable. Error: ${err.message}.`,
          severity: 'critical',
          affectedServices: [source.serviceType || 'backend', 'DevOps'],
        };
      }

      if (diagnosis && diagnosis.isIssue) {
        const isDuplicate = await incidentModel.findOne({
          companyId: company._id,
          title: diagnosis.title,
          status: { $ne: 'resolved' },
          createdAt: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
        });

        if (isDuplicate) continue;

        const incident = await incidentModel.create({
          companyId: company._id,
          title: diagnosis.title,
          description: diagnosis.description,
          severity: diagnosis.severity,
          affectedServices: diagnosis.affectedServices,
          aiSummary: isServerDown
            ? 'Smart Response System detected a connection failure.'
            : 'Smart Response AI detected log anomalies.',
          status: 'open',
        });

        try {
          const io = getIO();
          io.to(company._id.toString()).emit('new-incident', {
            success: true,
            message: `${incident.severity.toUpperCase()}: ${incident.title}`,
            data: incident,
          });
        } catch (socketErr) {
          console.error('[Socket Error]', socketErr.message);
        }

        const matchedEngineers = await engineerModel
          .find({
            companyId: company._id,
            expertise: { $in: diagnosis.affectedServices },
          })
          .populate('userId', 'email username');

        if (matchedEngineers.length > 0) {
          incident.assignedEngineers = matchedEngineers.map((e) => e.userId._id);
          await incident.save();

          for (const eng of matchedEngineers) {
            await sendEmail({
              to: eng.userId.email,
              subject: `[${incident.severity.toUpperCase()}] New Incident: ${incident.title}`,
              html: incidentAlertTemplate(incident, company.name),
            });
          }
        } else {
          if (company.ownerId && company.ownerId.email) {
            await sendEmail({
              to: company.ownerId.email,
              subject: `No Engineers Available: ${incident.title}`,
              html: `
                <h3>Hello ${company.ownerId.username},</h3>
                <p>An incident was detected, but no matching engineers were found for: <b>${diagnosis.affectedServices.join(', ')}</b>.</p>
                <p><b>Incident:</b> ${incident.title}</p>
                <p>Please assign someone manually from the dashboard.</p>
              `,
            });
          }
        }
      }
    }
  }

  if (res) res.status(200).json({ success: true, message: 'Monitoring cycle finished.' });
});

export const getAllIncidents = asyncHandler(async (req, res) => {
  const { role, _id, companyId } = req.user;

  let query = { companyId: companyId };

  if (role === 'engineer') {
    query.assignedEngineers = _id;
  }

  const incidents = await incidentModel
    .find(query)
    .sort({ createdAt: -1 })
    .populate('assignedEngineers', 'username email');

  res.status(200).json({ success: true, incidents });
});

export const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolutionSummary } = req.body;

  const incident = await incidentModel.findById(id);

  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  incident.status = status || incident.status;
  if (resolutionSummary) incident.resolutionSummary = resolutionSummary;

  await incident.save();

  try {
    const io = getIO();
    io.to(incident.companyId.toString()).emit('incident-updated', {
      incidentId: id,
      newStatus: incident.status,
    });
  } catch (err) {
    console.error('[Socket Error] Update emission failed');
  }

  res.status(200).json({ success: true, incident });
});

export const getIncidentDetails = asyncHandler(async (req, res) => {
  const incident = await incidentModel
    .findById(req.params.id)
    .populate('companyId', 'name')
    .populate('assignedEngineers', 'username email');

  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident details not found' });
  }

  res.status(200).json({ success: true, incident });
});
