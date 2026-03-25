import { Router } from 'express';
import {
  acknowledgeAlert,
  createMachine,
  deleteMachine,
  getAlerts,
  getMachineAnalytics,
  getMachineReadings,
  getMachineReadingsById,
  getMachines,
  getSummary,
  ingestMachineData,
  resolveAlert,
  updateMachine
} from '../controllers/machineController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getMachines);
router.post('/', authenticate, authorize(['ADMIN']), createMachine);
router.put('/:machineId', authenticate, authorize(['ADMIN']), updateMachine);
router.delete('/:machineId', authenticate, authorize(['ADMIN']), deleteMachine);
router.post('/data', ingestMachineData);
router.get('/readings', getMachineReadings);
router.get('/summary', getSummary);
router.get('/alerts', getAlerts);
router.patch('/alerts/:alertId/acknowledge', authenticate, authorize(['ADMIN', 'OPERATOR']), acknowledgeAlert);
router.patch('/alerts/:alertId/resolve', authenticate, authorize(['ADMIN', 'OPERATOR']), resolveAlert);
router.get('/analytics/performance', getMachineAnalytics);
router.get('/:machineId/readings', getMachineReadingsById);

export default router;
