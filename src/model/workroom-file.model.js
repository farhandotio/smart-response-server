import mongoose from 'mongoose';

const workroomFileSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true,
      unique: true,
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      required: true,
    },
    uploaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['code', 'image', 'archive', 'doc'],
      required: true,
    },
  },
  { timestamps: true }
);

const workroomFileModel = mongoose.model('WorkroomFile', workroomFileSchema);
export default workroomFileModel;
