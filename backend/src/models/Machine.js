import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['on', 'off'], default: 'off' },
    speed: { type: Number, min: 0, default: 0 },
    temperature: { type: Number, min: -50, default: 25 }
  },
  { versionKey: false, timestamps: true }
);

machineSchema.index({ name: 1 }, { unique: true });

export const Machine = mongoose.model('Machine', machineSchema);
