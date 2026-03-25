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
      required: true,
      index: true
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
      default: 'open',
      index: true
    },
    escalationLevel: {
      type: Number,
      min: 0,
      default: 0
    },
    dedupeKey: {
      type: String,
      trim: true,
      index: true
    },
    acknowledgedBy: {
      type: String,
      trim: true,
      default: ''
    },
    resolvedBy: {
      type: String,
      trim: true,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    acknowledgedAt: Date,
    resolvedAt: Date
  },
  {
    versionKey: false
  }
);

alertSchema.index({ machineId: 1, createdAt: -1 });
alertSchema.index({ dedupeKey: 1, status: 1 });

export const Alert = mongoose.model('Alert', alertSchema);
