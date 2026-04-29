import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true,
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Developer',
      required: true,
    },
    comment: {
      type: String,
    },
    files: [
      {
        fileId: {
          type: String,
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['Submitted', 'RevisionRequested', 'Accepted'],
      default: 'Submitted',
    },
  },
  { timestamps: true }
);

const submissionModel = mongoose.model('Submission', submissionSchema);
export default submissionModel;
