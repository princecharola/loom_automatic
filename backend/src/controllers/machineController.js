import { MachineReading } from '../models/MachineReading.js';
import { Alert } from '../models/Alert.js';
import { Machine } from '../models/Machine.js';
import { evaluateAlerts, updateAlertStatus } from '../services/alertService.js';
import { getSocket } from '../config/socket.js';

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function getMachines(req, res, next) {
  try {
    const { status, search = '', sortBy = 'machineId', sortOrder = 'asc', operator } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (status) query.status = status;
    if (operator) query.assignedOperators = operator;
    if (search) {
      query.$or = [
        { machineId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const [items, total] = await Promise.all([
      Machine.find(query).sort(sort).skip(skip).limit(limit),
      Machine.countDocuments(query)
    ]);

    return res.json({ items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
}

export async function createMachine(req, res, next) {
  try {
    const { machineId, name, location, type, assignedOperators = [], thresholds, status, speed = 0 } = req.body;

    const machine = await Machine.create({
      machineId,
      name,
      type,
      location,
      assignedOperators,
      thresholds,
      status,
      speed,
      timestamp: new Date()
    });

    return res.status(201).json(machine);
  } catch (error) {
    return next(error);
  }
}

export async function updateMachine(req, res, next) {
  try {
    const { machineId } = req.params;
    const machine = await Machine.findOneAndUpdate({ machineId }, req.body, {
      new: true,
      runValidators: true
    });

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found.' });
    }

    return res.json(machine);
  } catch (error) {
    return next(error);
  }
}

export async function deleteMachine(req, res, next) {
  try {
    const { machineId } = req.params;
    const machine = await Machine.findOneAndDelete({ machineId });

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

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

    await Machine.findOneAndUpdate(
      { machineId: reading.machineId },
      {
        machineId: reading.machineId,
        name: reading.machineId,
        status: reading.status,
        speed: reading.speed,
        timestamp: reading.timestamp
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
    const { machineId, status, sortOrder = 'desc' } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (machineId) query.machineId = machineId;
    if (status) query.status = status;

    const [items, total] = await Promise.all([
      MachineReading.find(query)
        .sort({ timestamp: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      MachineReading.countDocuments(query)
    ]);

    return res.json({ items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
}

export async function getMachineReadingsById(req, res, next) {
  try {
    const { machineId } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const [items, total] = await Promise.all([
      MachineReading.find({ machineId }).sort({ timestamp: -1 }).skip(skip).limit(limit),
      MachineReading.countDocuments({ machineId })
    ]);

    return res.json({ items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
}

export async function getAlerts(req, res, next) {
  try {
    const { machineId, status, severity, sortOrder = 'desc' } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const query = {};

    if (machineId) query.machineId = machineId;
    if (status) query.status = status;
    if (severity) query.type = severity;

    const [items, total] = await Promise.all([
      Alert.find(query)
        .sort({ createdAt: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(query)
    ]);

    return res.json({ items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
}

export async function acknowledgeAlert(req, res, next) {
  try {
    const alert = await updateAlertStatus(req.params.alertId, 'acknowledged', req.user?.email || 'system');
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    return res.json(alert);
  } catch (error) {
    return next(error);
  }
}

export async function resolveAlert(req, res, next) {
  try {
    const alert = await updateAlertStatus(req.params.alertId, 'resolved', req.user?.email || 'system');
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found.' });
    }

    return res.json(alert);
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

export async function getMachineAnalytics(req, res, next) {
  try {
    const { machineId } = req.query;
    const match = machineId ? { machineId } : {};

    const performance = await MachineReading.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$machineId',
          averageSpeed: { $avg: '$speed' },
          maxSpeed: { $max: '$speed' },
          minSpeed: { $min: '$speed' },
          totalReadings: { $sum: 1 },
          runningReadings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'running'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          machineId: '$_id',
          averageSpeed: { $round: ['$averageSpeed', 2] },
          maxSpeed: 1,
          minSpeed: 1,
          totalReadings: 1,
          uptimePercent: {
            $cond: [
              { $eq: ['$totalReadings', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$runningReadings', '$totalReadings'] }, 100] }, 2] }
            ]
          }
        }
      },
      { $sort: { machineId: 1 } }
    ]);

    return res.json(performance);
  } catch (error) {
    return next(error);
  }
}
