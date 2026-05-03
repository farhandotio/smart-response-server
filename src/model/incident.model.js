import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },

    title: { type: String },

    description: { type: String },

    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },

    status: {
      type: String,
      enum: ['open', 'investigating', 'identified', 'monitoring', 'resolved'],
      default: 'open',
    },

    affectedServices: [{ type: String }],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    assignedEngineers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    aiSummary: String,

    resolutionSummary: String,
  },
  { timestamps: true }
);

// Atomic unique index: prevent duplicate active incidents for the same company+title
incidentSchema.index(
  { companyId: 1, title: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['open', 'investigating', 'identified', 'monitoring'] } },
    name: 'unique_active_incident',
  }
);

const incidentModel = mongoose.model('Incident', incidentSchema);
export default incidentModel;