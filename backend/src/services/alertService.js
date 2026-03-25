import { Alert } from '../models/Alert.js';
import { Machine } from '../models/Machine.js';
import { sendEmailNotification, sendPushNotificationHook } from './notificationService.js';

function buildDedupeKey(machineId, type) {
  return `${machineId}:${type}`;
}

async function createOrEscalateAlert(payload, io) {
  const dedupeKey = buildDedupeKey(payload.machineId, payload.type);
  const existingOpen = await Alert.findOne({ dedupeKey, status: { $in: ['open', 'acknowledged'] } }).sort({ createdAt: -1 });

  if (existingOpen) {
    existingOpen.escalationLevel += 1;
    existingOpen.speed = payload.speed;
    existingOpen.message = payload.message;
    await existingOpen.save();

    if (io) {
      io.emit('machine:alert', existingOpen);
      io.to(`machine:${existingOpen.machineId}`).emit('machine:alert', existingOpen);
    }

    return existingOpen;
  }

  const alert = await Alert.create({
    ...payload,
    dedupeKey,
    escalationLevel: 0
  });

  if (io) {
    io.emit('machine:alert', alert);
    io.to(`machine:${alert.machineId}`).emit('machine:alert', alert);
  }

  await Promise.all([
    sendEmailNotification({
      subject: `[Loom Alert] ${alert.machineId} ${alert.type}`,
      message: alert.message,
      recipients: (process.env.NOTIFICATION_EMAILS || '').split(',').filter(Boolean)
    }),
    sendPushNotificationHook({
      event: 'machine.alert',
      machineId: alert.machineId,
      type: alert.type,
      message: alert.message
    })
  ]);

  return alert;
}

export async function evaluateAlerts(reading, io) {
  const machine = await Machine.findOne({ machineId: reading.machineId }).lean();
  const warningThreshold = machine?.thresholds?.warningSpeed ?? Number(process.env.SPEED_WARNING_THRESHOLD || 80);
  const criticalThreshold = machine?.thresholds?.criticalSpeed ?? Number(process.env.SPEED_CRITICAL_THRESHOLD || 10);

  const alerts = [];

  if (reading.speed === 0 || reading.speed <= criticalThreshold) {
    alerts.push(
      await createOrEscalateAlert(
        {
          machineId: reading.machineId,
          type: 'critical',
          message: `Machine ${reading.machineId} reached critical speed.`,
          speed: reading.speed,
          threshold: criticalThreshold
        },
        io
      )
    );
  } else if (reading.speed < warningThreshold) {
    alerts.push(
      await createOrEscalateAlert(
        {
          machineId: reading.machineId,
          type: 'warning',
          message: `Machine ${reading.machineId} speed dropped below warning threshold.`,
          speed: reading.speed,
          threshold: warningThreshold
        },
        io
      )
    );
  }

  return alerts;
}

export async function updateAlertStatus(alertId, status, userEmail) {
  const alert = await Alert.findById(alertId);
  if (!alert) {
    return null;
  }

  alert.status = status;
  if (status === 'acknowledged') {
    alert.acknowledgedBy = userEmail;
    alert.acknowledgedAt = new Date();
  }

  if (status === 'resolved') {
    alert.resolvedBy = userEmail;
    alert.resolvedAt = new Date();
  }

  await alert.save();
  return alert;
}
