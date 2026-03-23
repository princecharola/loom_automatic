import mongoose from 'mongoose';

const machineReadingSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    speed: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'error'],
      required: true
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    receivedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

machineReadingSchema.index({ machineId: 1, timestamp: -1 });
machineReadingSchema.index({ status: 1, timestamp: -1 });
machineReadingSchema.index({ timestamp: -1 });

export const MachineReading = mongoose.model('MachineReading', machineReadingSchema);
