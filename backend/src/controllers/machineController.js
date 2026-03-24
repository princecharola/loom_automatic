import { Machine } from '../models/Machine.js';
import { Alert } from '../models/Alert.js';
import { maybeCreateAlerts } from '../services/alertService.js';
import { getSocket } from '../config/socket.js';

export async function listMachines(req, res, next) {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    return res.json(machines);
  } catch (error) {
    return next(error);
  }
}

export async function createMachine(req, res, next) {
  try {
    const { name, status = 'off', speed = 0, temperature = 25 } = req.body;
    const machine = await Machine.create({ name, status, speed, temperature });
    const io = getSocket();
    io.emit('machine:update', machine);

    const alerts = await maybeCreateAlerts(machine, io);
    return res.status(201).json({ machine, alerts });
  } catch (error) {
    return next(error);
  }
}

export async function updateMachine(req, res, next) {
  try {
    const { id } = req.params;
    const machine = await Machine.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const io = getSocket();
    io.emit('machine:update', machine);
    const alerts = await maybeCreateAlerts(machine, io);

    return res.json({ machine, alerts });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMachine(req, res, next) {
  try {
    const { id } = req.params;
    const machine = await Machine.findByIdAndDelete(id);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    getSocket().emit('machine:delete', { id });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function listAlerts(req, res, next) {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(Number(req.query.limit || 50));
    return res.json(alerts);
  } catch (error) {
    return next(error);
  }
}

export async function summary(req, res, next) {
  try {
    const machines = await Machine.find().sort({ updatedAt: -1 });
    const totals = {
      total: machines.length,
      on: machines.filter((m) => m.status === 'on').length,
      off: machines.filter((m) => m.status === 'off').length,
      avgTemperature: machines.length
        ? Math.round((machines.reduce((sum, m) => sum + m.temperature, 0) / machines.length) * 10) / 10
        : 0
    };

    return res.json({ totals, machines });
  } catch (error) {
    return next(error);
  }
}
