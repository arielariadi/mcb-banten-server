import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },

  taskScreenshot: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },

  submittedAt: {
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

export default mongoose.model('Submission', submissionSchema);
