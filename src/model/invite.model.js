import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    expiresAt: { type: Date, default: () => Date.now() + 48 * 60 * 60 * 1000 },
  },
  { timestamps: true }
);

export default mongoose.model('Invite', inviteSchema);
