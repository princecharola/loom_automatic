import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine', required: true },
    machineName: { type: String, required: true },
    type: { type: String, enum: ['TEMP_HIGH', 'MACHINE_STOPPED'], required: true },
    message: { type: String, required: true },
    level: { type: String, enum: ['warning', 'critical'], required: true },
    resolved: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true, versionKey: false }
);

alertSchema.index({ owner: 1, createdAt: -1 });
alertSchema.index({ machine: 1, resolved: 1 });

export const Alert = mongoose.model('Alert', alertSchema);
