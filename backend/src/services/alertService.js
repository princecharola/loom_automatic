import { Alert } from '../models/Alert.js';
import { getSocket } from '../config/socket.js';

export async function evaluateMachineAlerts(machine) {
  const threshold = Number(process.env.TEMP_ALERT_THRESHOLD || 80);
  const alerts = [];

  if (machine.temperature > threshold) {
    alerts.push(
      await createAlert({
        machine,
        type: 'TEMP_HIGH',
        level: 'warning',
        message: `${machine.name} temperature is ${machine.temperature}°C (threshold: ${threshold}°C).`
      })
    );
  }

  if (machine.status === 'OFF') {
    alerts.push(
      await createAlert({
        machine,
        type: 'MACHINE_STOPPED',
        level: 'critical',
        message: `${machine.name} is OFF.`
      })
    );
  }

  return alerts;
}

async function createAlert({ machine, type, level, message }) {
  const alert = await Alert.create({
    machine: machine._id,
    machineName: machine.name,
    type,
    level,
    message,
    owner: machine.owner
  });

  const io = getSocket();
  io.to('dashboard').emit('alert:created', alert);

  return alert;
}
