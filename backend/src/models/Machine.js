import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      default: 'loom',
      trim: true
    },
    location: {
      type: String,
      default: 'Floor 1',
      trim: true
    },
    assignedOperators: {
      type: [String],
      default: []
    },
    thresholds: {
      warningSpeed: {
        type: Number,
        min: 0,
        default: 80
      },
      criticalSpeed: {
        type: Number,
        min: 0,
        default: 10
      },
      maxIdleMinutes: {
        type: Number,
        min: 1,
        default: 10
      }
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'error'],
      default: 'stopped',
      index: true
    },
    speed: {
      type: Number,
      min: 0,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

machineSchema.index({ status: 1, timestamp: -1 });

export const Machine = mongoose.model('Machine', machineSchema);
