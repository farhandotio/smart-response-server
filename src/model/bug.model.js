import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    techTags: {
      type: [String],
      required: true,
    },
    budgetMin: {
      type: Number,
      required: true,
    },
    budgetMax: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'InProgress', 'Completed', 'Canceled'],
      default: 'Open',
    },
  },
  { timestamps: true }
);

const bugModel = mongoose.model('Bug', bugSchema);
export default bugModel;
