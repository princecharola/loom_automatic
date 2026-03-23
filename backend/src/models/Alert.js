import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      enum: ['warning', 'critical', 'error'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    speed: {
      type: Number,
      min: 0
    },
    threshold: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'resolved'],
      default: 'open'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

alertSchema.index({ machineId: 1, createdAt: -1 });
alertSchema.index({ status: 1, type: 1, createdAt: -1 });

export const Alert = mongoose.model('Alert', alertSchema);
