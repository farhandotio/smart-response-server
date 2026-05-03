import incidentModel from '../model/incident.model.js';
import companyModel from '../model/company.model.js';
import engineerModel from '../model/engineer.model.js';
import { analyzeLogWithAI } from '../utils/aiDiagnosis.js';
import { sendEmail } from '../utils/sendEmail.js';
import { incidentAlertTemplate } from '../email/incidentAlert.js';
import asyncHandler from '../utils/asynhandler.js';
import axios from 'axios';
import { getIO } from '../config/socket.js';

let isScanning = false;

export const autoMonitorLogs = asyncHandler(async (req, res) => {
  if (isScanning) {
    console.log('[Monitor] Cycle already in progress, skipping...');
    if (res) return res.status(200).json({ success: true, message: 'Scan already in progress' });
    return;
  }

  isScanning = true;
  console.log('[Monitor] Starting log monitoring cycle...');

  try {
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
          diagnosis = {
            isIssue: true,
            title: `Service Down: ${source.sourceName}`,
            description: `Unreachable service at ${source.logUrl}. Error: ${err.message}`,
            severity: 'critical',
            affectedServices: [source.serviceType || 'backend'],
          };
        }

        if (!diagnosis?.isIssue) continue;

        try {
          const activeStatuses = ['open', 'investigating', 'identified', 'monitoring'];

          let incident = await incidentModel.findOneAndUpdate(
            {
              companyId: company._id,
              title: diagnosis.title,
              status: { $in: activeStatuses },
            },
            {
              $set: { lastDetected: new Date() },
            },
            { returnDocument: 'after' }
          );

          if (!incident) {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            incident = await incidentModel.findOneAndUpdate(
              {
                companyId: company._id,
                title: diagnosis.title,
                status: 'resolved',
                updatedAt: { $gt: twentyFourHoursAgo },
              },
              {
                $set: {
                  status: 'open',
                  aiSummary: 'Issue re-detected by AI monitoring.',
                  lastDetected: new Date(),
                },
              },
              { returnDocument: 'after' }
            );

            if (incident) {
              getIO()
                .to(company._id.toString())
                .emit('incident-updated', {
                  incidentId: incident._id,
                  newStatus: 'open',
                  message: `RE-OPENED: ${incident.title}`,
                });
            }
          }

          if (!incident) {
            incident = await incidentModel.create({
              companyId: company._id,
              title: diagnosis.title,
              description: diagnosis.description,
              severity: diagnosis.severity,
              affectedServices: diagnosis.affectedServices,
              aiSummary: isServerDown
                ? 'Connection failure detected.'
                : 'AI detected log anomalies.',
              status: 'open',
              lastDetected: new Date(),
            });

            console.log(`[Monitor] New incident created: ${incident.title}`);
            getIO()
              .to(company._id.toString())
              .emit('new-incident', { success: true, data: incident });

            const matchedEngineers = await engineerModel
              .find({
                companyId: company._id,
                expertise: { $in: diagnosis.affectedServices },
              })
              .populate('userId');

            if (matchedEngineers.length > 0) {
              incident.assignedEngineers = matchedEngineers.map((e) => e.userId._id);
              await incident.save();

              for (const eng of matchedEngineers) {
                if (eng.userId?.email) {
                  sendEmail({
                    to: eng.userId.email,
                    subject: `[${incident.severity.toUpperCase()}] Incident: ${incident.title}`,
                    html: incidentAlertTemplate(incident, company.name),
                  }).catch((e) => console.error('[Email Error]:', e.message));
                }
              }
            }
          }
        } catch (dbErr) {
          if (dbErr.code === 11000) {
            console.log(`[Monitor] Duplicate blocked: ${diagnosis.title}`);
          } else {
            console.error('[Monitor] DB Error for company', company._id, ':', dbErr.message);
          }
          continue;
        }
      }
    }
  } catch (error) {
    console.error('[Monitor] Global Cycle Error:', error.message);
  } finally {
    isScanning = false;
    console.log('[Monitor] Cycle complete.');
  }

  if (res) res.status(200).json({ success: true, message: 'Monitoring cycle finished.' });
});

autoMonitorLogs.directExecute = async () => {
  return await autoMonitorLogs({ user: { role: 'system' } }, null);
};

export const getAllIncidents = asyncHandler(async (req, res) => {
  const { id, role } = req.user;
  const { page = 1, limit = 10, status, severity } = req.query;

  let companyId = null;
  let query = {};

  if (role === 'company_admin') {
    const company = await companyModel.findOne({ ownerId: id });
    if (company) companyId = company._id;
  } else if (role === 'engineer') {
    const engineer = await engineerModel.findOne({ userId: id });
    if (!engineer?.companyId) {
      // Engineer not part of any workspace — return empty
      return res.status(200).json({ success: true, incidents: [], total: 0, page: 1, pages: 1 });
    }
    companyId = engineer.companyId;
  }

  // Safety net: if companyId is still null, return nothing
  if (!companyId) {
    return res.status(200).json({ success: true, incidents: [], total: 0, page: 1, pages: 1 });
  }

  query.companyId = companyId;

  if (status && status !== 'all') query.status = status;
  if (severity && severity !== 'all') query.severity = severity;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await incidentModel.countDocuments(query);
  const incidents = await incidentModel
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('assignedEngineers', 'username email');

  res.status(200).json({
    success: true,
    incidents,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  });
});

export const updateIncidentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, resolutionSummary } = req.body;

  const incident = await incidentModel.findById(id);

  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }

  // Only owner or assigned engineers can update
  const isOwner = req.user.role === 'company_admin';

  if (isOwner) {
    // Verify this admin owns the company that owns this incident
    const company = await companyModel.findOne({ ownerId: req.user.id });
    if (!company || company._id.toString() !== incident.companyId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have access to this incident.' });
    }
  } else {
    // Engineer: must belong to same company AND be assigned
    const engineer = await engineerModel.findOne({ userId: req.user.id });
    if (!engineer?.companyId || engineer.companyId.toString() !== incident.companyId.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not a member of this workspace.' });
    }
    const isAssigned = incident.assignedEngineers.some(
      (engId) => engId.toString() === req.user.id.toString()
    );
    if (!isAssigned) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'You must be assigned to this incident to update its status.',
        });
    }
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
  const { id: userId, role } = req.user;

  const incident = await incidentModel
    .findById(req.params.id)
    .populate('companyId', 'name')
    .populate('assignedEngineers', 'username email');

  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident details not found' });
  }

  // Verify the requester belongs to this incident's company
  if (role === 'engineer') {
    const engineer = await engineerModel.findOne({ userId });
    if (
      !engineer?.companyId ||
      engineer.companyId.toString() !== incident.companyId._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have access to this incident.' });
    }
  } else if (role === 'company_admin') {
    const company = await companyModel.findOne({ ownerId: userId });
    if (!company || company._id.toString() !== incident.companyId._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have access to this incident.' });
    }
  }

  res.status(200).json({ success: true, incident });
});

export const assignEngineer = asyncHandler(async (req, res) => {
  const { id } = req.params; // incident id
  const { engineerId } = req.body; // optional

  const incident = await incidentModel.findById(id).populate('assignedEngineers', 'username email');
  if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

  // Permission checks
  if (req.user.role === 'company_admin') {
    // Owner can assign any engineer (must belong to same company)
    if (!engineerId)
      return res
        .status(400)
        .json({ success: false, message: 'engineerId required for owner assignment' });
    const engineer = await engineerModel.findOne({
      _id: engineerId,
      companyId: incident.companyId,
    });
    if (!engineer)
      return res
        .status(404)
        .json({ success: false, message: 'Engineer not part of this workspace' });
  } else if (req.user.role === 'engineer') {
    // Engineer can only assign themselves
    if (engineerId && engineerId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: 'Engineers can only assign themselves' });
    }
    // Ensure engineer belongs to same company
    const eng = await engineerModel.findOne({ userId: req.user.id, companyId: incident.companyId });
    if (!eng)
      return res
        .status(403)
        .json({ success: false, message: 'You are not part of this workspace' });
  }

  const toAdd = engineerId || req.user.id;
  // Add to assignedEngineers if not already present
  if (!incident.assignedEngineers.some((e) => e._id.toString() === toAdd.toString())) {
    incident.assignedEngineers.push(toAdd);
    await incident.save();
  }

  // Populate response
  const updated = await incidentModel.findById(id).populate('assignedEngineers', 'username email');
  res.status(200).json({ success: true, incident: updated });
});

export const unassignEngineer = asyncHandler(async (req, res) => {
  const { id } = req.params; // incident id
  const { engineerId } = req.body; // required

  const incident = await incidentModel.findById(id).populate('assignedEngineers', 'username email');
  if (!incident) return res.status(404).json({ success: false, message: 'Incident not found' });

  // Permission checks
  if (req.user.role === 'company_admin') {
    if (!engineerId)
      return res
        .status(400)
        .json({ success: false, message: 'engineerId required for owner unassignment' });
  } else if (req.user.role === 'engineer') {
    if (engineerId && engineerId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: 'Engineers can only unassign themselves' });
    }
    // Ensure engineer belongs to same company
    const eng = await engineerModel.findOne({ userId: req.user.id, companyId: incident.companyId });
    if (!eng)
      return res
        .status(403)
        .json({ success: false, message: 'You are not part of this workspace' });
  }

  const toRemove = engineerId || req.user.id;
  incident.assignedEngineers = incident.assignedEngineers.filter(
    (e) => e._id.toString() !== toRemove.toString()
  );
  await incident.save();

  const updated = await incidentModel.findById(id).populate('assignedEngineers', 'username email');
  res.status(200).json({ success: true, incident: updated });
});
