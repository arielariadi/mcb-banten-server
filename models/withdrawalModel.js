import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  paymentMethodNumber: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },

  requestedAt: {
    type: Date,
    default: Date.now,
  },

  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  validatedAt: {
    type: Date,
  },

  rejectedReason: {
    type: String,
  },
});

export default mongoose.model('Withdrawal', withdrawalSchema);
