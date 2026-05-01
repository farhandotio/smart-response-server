import mongoose from "mongoose";

const statusPageSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  },

  customDomain: { type: String },

  isPublic: { type: Boolean },

  theme: { type: String },
});

const statusPageModel = mongoose.model('StatusPage', statusPageSchema);
export default statusPageModel;