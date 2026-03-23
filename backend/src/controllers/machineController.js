import { MachineReading } from '../models/MachineReading.js';
import { Alert } from '../models/Alert.js';
import { evaluateAlerts } from '../services/alertService.js';
import { getSocket } from '../config/socket.js';

export async function ingestMachineData(req, res, next) {
  try {
    const { machineId, speed, status, timestamp } = req.body;

    const normalizedStatus = Number(speed) === 0 ? 'stopped' : status;

    const reading = await MachineReading.create({
      machineId,
      speed,
      status: normalizedStatus,
      timestamp
    });

    const io = getSocket();
    io.emit('machine:reading', reading);
    io.to(`machine:${reading.machineId}`).emit('machine:reading', reading);

    const alerts = await evaluateAlerts(reading, io);

    return res.status(201).json({
      message: 'Machine data stored successfully.',
      reading,
      alerts
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMachineReadings(req, res, next) {
  try {
    const { machineId, status, limit = 100 } = req.query;
    const query = {};

    if (machineId) query.machineId = machineId;
    if (status) query.status = status;

    const readings = await MachineReading.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    return res.json(readings);
  } catch (error) {
    return next(error);
  }
}

export async function getMachineReadingsById(req, res, next) {
  try {
    const { machineId } = req.params;
    const { limit = 100 } = req.query;

    const readings = await MachineReading.find({ machineId })
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    return res.json(readings);
  } catch (error) {
    return next(error);
  }
}

export async function getAlerts(req, res, next) {
  try {
    const { machineId, status, limit = 100 } = req.query;
    const query = {};

    if (machineId) query.machineId = machineId;
    if (status) query.status = status;

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json(alerts);
  } catch (error) {
    return next(error);
  }
}

export async function getSummary(req, res, next) {
  try {
    const latestReadings = await MachineReading.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$machineId',
          machineId: { $first: '$machineId' },
          speed: { $first: '$speed' },
          status: { $first: '$status' },
          timestamp: { $first: '$timestamp' }
        }
      },
      { $sort: { machineId: 1 } }
    ]);

    return res.json(latestReadings);
  } catch (error) {
    return next(error);
  }
}
