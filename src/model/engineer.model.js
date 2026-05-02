import mongoose from 'mongoose';

const engineerProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },

  picture : { type: String, default: '' },

  expertise: [{ type: String }],

  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'lead'],
  },

  bio: { type: String },

  availabilityStatus: {
    type: String,
    enum: ['online', 'busy', 'offline'],
    default: 'offline',
  },

  notifications: [
    {
      type: { type: String, enum: ['invitation', 'alert', 'system'], default: 'system' },
      message: { type: String, required: true },
      link: { type: String },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const engineerModel = mongoose.model('EngineerProfile', engineerProfileSchema);
export default engineerModel;