import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Developer',
      required: true,
    },
    offeredPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'InProgress', 'Completed'],
      default: 'Pending',
    },
    acceptedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const invitationModel = mongoose.model('Invitation', invitationSchema);
export default invitationModel;
