import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: '' },
    description: { type: String, maxlength: 500 },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const companyModel = mongoose.model('Company', companySchema);
export default companyModel;
