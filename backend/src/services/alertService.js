import { Alert } from '../models/Alert.js';

export async function evaluateAlerts(reading, io) {
  const threshold = Number(process.env.SPEED_WARNING_THRESHOLD || 80);
  const alerts = [];

  if (reading.speed === 0) {
    alerts.push(
      await createAlert(
        {
          machineId: reading.machineId,
          type: 'critical',
          message: `Machine ${reading.machineId} has stopped.`,
          speed: reading.speed,
          threshold
        },
        io
      )
    );
  } else if (reading.speed < threshold) {
    alerts.push(
      await createAlert(
        {
          machineId: reading.machineId,
          type: 'warning',
          message: `Machine ${reading.machineId} speed dropped below threshold.`,
          speed: reading.speed,
          threshold
        },
        io
      )
    );
  }

  return alerts;
}

async function createAlert(payload, io) {
  const alert = await Alert.create(payload);

  if (io) {
    io.emit('machine:alert', alert);
    io.to(`machine:${alert.machineId}`).emit('machine:alert', alert);
  }

  if (process.env.EMAIL_NOTIFICATIONS === 'true') {
    console.log(`Notification placeholder: ${alert.message}`);
  }

  return alert;
}
