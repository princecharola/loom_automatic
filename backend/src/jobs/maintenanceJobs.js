import { Alert } from '../models/Alert.js';
import { Machine } from '../models/Machine.js';
import { logger } from '../utils/logger.js';

let monitorInterval;
let cleanupInterval;
let reportInterval;

export function startMaintenanceJobs() {
  const staleMinutes = Number(process.env.HEALTH_STALE_MINUTES || 20);
  const cleanupDays = Number(process.env.ALERT_RETENTION_DAYS || 30);

  monitorInterval = setInterval(async () => {
    const staleDate = new Date(Date.now() - staleMinutes * 60 * 1000);
    const staleMachines = await Machine.find({ timestamp: { $lt: staleDate }, status: { $ne: 'error' } }).select('machineId');

    if (staleMachines.length > 0) {
      logger.warn('Detected stale machines', {
        count: staleMachines.length,
        machineIds: staleMachines.map((item) => item.machineId)
      });
    }
  }, 5 * 60 * 1000);

  cleanupInterval = setInterval(async () => {
    const cutoff = new Date(Date.now() - cleanupDays * 24 * 60 * 60 * 1000);
    const result = await Alert.deleteMany({ status: 'resolved', createdAt: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      logger.info('Resolved alert cleanup completed', { deletedCount: result.deletedCount });
    }
  }, 12 * 60 * 60 * 1000);

  reportInterval = setInterval(async () => {
    const machineCount = await Machine.countDocuments();
    const openAlertCount = await Alert.countDocuments({ status: 'open' });
    logger.info('Fleet heartbeat report', { machineCount, openAlertCount });
  }, 60 * 60 * 1000);
}

export function stopMaintenanceJobs() {
  [monitorInterval, cleanupInterval, reportInterval].forEach((id) => {
    if (id) clearInterval(id);
  });
}
