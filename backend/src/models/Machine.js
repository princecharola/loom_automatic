import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['ON', 'OFF', 'ERROR'],
      default: 'OFF'
    },
    speed: { type: Number, default: 0, min: 0 },
    temperature: { type: Number, default: 25, min: 0 },
    lastUpdated: { type: Date, default: Date.now },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

machineSchema.index({ owner: 1, name: 1 }, { unique: true });
machineSchema.index({ owner: 1, status: 1, lastUpdated: -1 });

export const Machine = mongoose.model('Machine', machineSchema);
