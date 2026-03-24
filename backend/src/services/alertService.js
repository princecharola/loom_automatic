import { Alert } from '../models/Alert.js';

export async function maybeCreateAlerts(machine, io) {
  const alerts = [];
  const tempThreshold = Number(process.env.TEMPERATURE_THRESHOLD || 90);

  if (machine.temperature > tempThreshold) {
    alerts.push(
      await createAlert(
        {
          machineId: machine._id.toString(),
          type: 'warning',
          message: `${machine.name} temperature exceeded threshold (${machine.temperature}°C).`,
          threshold: tempThreshold
        },
        io
      )
    );
  }

  if (machine.status === 'off') {
    alerts.push(
      await createAlert(
        {
          machineId: machine._id.toString(),
          type: 'critical',
          message: `${machine.name} has stopped.`
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
    io.emit('alert:new', alert);
  }
  return alert;
}
