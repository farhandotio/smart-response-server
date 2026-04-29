import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Deposit', 'Hold', 'Release', 'Refund'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    relatedInvitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model('Transaction', transactionSchema);
export default transactionModel;
