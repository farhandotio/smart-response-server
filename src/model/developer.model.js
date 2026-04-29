import mongoose from 'mongoose';

const developerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    techStack: {
      type: [String],
      required: true,
    },
    rateMin: {
      type: Number,
      required: true,
    },
    rateMax: {
      type: Number,
      required: true,
    },
    bio: {
      type: String,
    },
    portfolioLink: {
      type: String,
    },
  },
  { timestamps: true }
);

const developerModel = mongoose.model('Developer', developerSchema);
export default developerModel;
