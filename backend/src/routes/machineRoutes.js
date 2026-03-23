import { Router } from 'express';
import {
  getAlerts,
  getMachineReadings,
  getMachineReadingsById,
  getSummary,
  ingestMachineData
} from '../controllers/machineController.js';

const router = Router();

router.post('/data', ingestMachineData);
router.get('/readings', getMachineReadings);
router.get('/summary', getSummary);
router.get('/alerts', getAlerts);
router.get('/:machineId/readings', getMachineReadingsById);

export default router;
