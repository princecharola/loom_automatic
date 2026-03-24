import { Router } from 'express';
import {
  createMachine,
  deleteMachine,
  getAlerts,
  getMachineReadings,
  getMachineReadingsById,
  getMachines,
  getSummary,
  ingestMachineData,
  updateMachine
} from '../controllers/machineController.js';

const router = Router();

router.get('/', getMachines);
router.post('/', createMachine);
router.put('/:machineId', updateMachine);
router.delete('/:machineId', deleteMachine);
router.post('/data', ingestMachineData);
router.get('/readings', getMachineReadings);
router.get('/summary', getSummary);
router.get('/alerts', getAlerts);
router.get('/:machineId/readings', getMachineReadingsById);

export default router;
