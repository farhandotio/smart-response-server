import asyncHandler from '../utils/asynhandler.js';
import incidentModel from '../model/incident.model.js';
import engineerModel from '../model/engineer.model.js';
import companyModel from '../model/company.model.js';

// Get analytics for a specific company (owner)
export const getCompanyAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id; // company admin id
  const company = await companyModel.findOne({ ownerId: userId });
  if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

  const total = await incidentModel.countDocuments({ companyId: company._id });
  const byStatus = await incidentModel.aggregate([
    { $match: { companyId: company._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const bySeverity = await incidentModel.aggregate([
    { $match: { companyId: company._id } },
    { $group: { _id: '$severity', count: { $sum: 1 } } }
  ]);

  res.json({ success: true, data: { total, byStatus, bySeverity } });
});

// Get analytics for a specific engineer (their assigned incidents)
export const getEngineerAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id; // engineer user id
  const engineer = await engineerModel.findOne({ userId });
  if (!engineer) return res.status(404).json({ success: false, message: 'Engineer not found' });

  const total = await incidentModel.countDocuments({ assignedEngineers: engineer._id });
  const byStatus = await incidentModel.aggregate([
    { $match: { assignedEngineers: engineer._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  const bySeverity = await incidentModel.aggregate([
    { $match: { assignedEngineers: engineer._id } },
    { $group: { _id: '$severity', count: { $sum: 1 } } }
  ]);

  res.json({ success: true, data: { total, byStatus, bySeverity } });
});
