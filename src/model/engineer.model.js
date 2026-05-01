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
});

const engineerModel = mongoose.model('EngineerProfile', engineerProfileSchema);
export default engineerModel;