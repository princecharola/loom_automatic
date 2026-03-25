import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      default: 'Floor 1',
      trim: true
    },
    threshold: {
      type: Number,
      min: 0,
      default: Number(process.env.SPEED_WARNING_THRESHOLD || 80)
    },
    assignedOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'error'],
      default: 'stopped'
    },
    speed: {
      type: Number,
      min: 0,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

machineSchema.index({ assignedOperator: 1, machineId: 1 });

export const Machine = mongoose.model('Machine', machineSchema);
