import mongoose from "mongoose"

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyDesc: {
      type: String,
    },
  },
  { timestamps: true }
)

const clientModel = mongoose.model('Client', clientSchema)
export default clientModel
