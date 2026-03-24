import { Machine } from '../models/Machine.js';
import { Alert } from '../models/Alert.js';
import { getSocket } from '../config/socket.js';
import { evaluateMachineAlerts } from '../services/alertService.js';

export async function listMachines(req, res, next) {
  try {
    const machines = await Machine.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json(machines);
  } catch (error) {
    return next(error);
  }
}

export async function addMachine(req, res, next) {
  try {
    const machine = await Machine.create({ ...req.body, owner: req.user._id, lastUpdated: new Date() });

    const io = getSocket();
    io.to('dashboard').emit('machine:created', machine);

    const alerts = await evaluateMachineAlerts(machine);
    return res.status(201).json({ machine, alerts });
  } catch (error) {
    return next(error);
  }
}

export async function updateMachine(req, res, next) {
  try {
    const machine = await Machine.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    const io = getSocket();
    io.to('dashboard').emit('machine:updated', machine);

    const alerts = await evaluateMachineAlerts(machine);
    return res.json({ machine, alerts });
  } catch (error) {
    return next(error);
  }
}

export async function deleteMachine(req, res, next) {
  try {
    const machine = await Machine.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!machine) return res.status(404).json({ message: 'Machine not found' });

    const io = getSocket();
    io.to('dashboard').emit('machine:deleted', { id: machine._id.toString() });

    return res.json({ message: 'Machine deleted' });
  } catch (error) {
    return next(error);
  }
}

export async function listAlerts(req, res, next) {
  try {
    const alerts = await Alert.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(100);
    return res.json(alerts);
  } catch (error) {
    return next(error);
  }
}
