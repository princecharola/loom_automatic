import { MachineReading } from '../models/MachineReading.js';
import { Alert } from '../models/Alert.js';
import { Machine } from '../models/Machine.js';
import { User } from '../models/User.js';
import { evaluateAlerts } from '../services/alertService.js';
import { getSocket } from '../config/socket.js';



export async function getMachines(req, res, next) {
  try {
    const machines = await Machine.find().sort({ machineId: 1 });
    return res.json(machines);
  } catch (error) {
    return next(error);
  }
}

export async function createMachine(req, res, next) {
  try {
    const { machineId, name, location, threshold, status, speed = 0 } = req.body;

    const machine = await Machine.create({
      machineId,
      name,
      location,
      threshold,
      status,
      speed,
      timestamp: new Date()
    });

    return res.status(201).json(machine);
  } catch (error) {
    return next(error);
  }
}

export async function getMachineById(req, res, next) {
  try {
    const { machineId } = req.params;
    const machine = await Machine.findOne({ machineId }).populate('assignedOperator', 'name email role');

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found.' });
    }

    return res.json(machine);
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

export async function assignMachineOperator(req, res, next) {
  try {
    const { machineId } = req.params;
    const { operatorId } = req.body;

    if (operatorId) {
      const operator = await User.findById(operatorId);
      if (!operator) {
        return res.status(404).json({ message: 'Operator not found.' });
      }
    }

    const machine = await Machine.findOneAndUpdate(
      { machineId },
      { assignedOperator: operatorId || null },
      { new: true, runValidators: true }
    ).populate('assignedOperator', 'name email role');

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
