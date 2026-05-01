import mongoose from "mongoose";

const incidentTimelineSchema = new mongoose.Schema(
  {
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    message: { type: String },

    type: {
      type: String,
      enum: ['update', 'investigation', 'fix', 'deployment', 'ai_suggestion'],
    },
  },
  { timestamps: true }
);

const incidentTimelineModel = mongoose.model('IncidentTimeline', incidentTimelineSchema);
export default incidentTimelineModel;