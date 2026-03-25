import { Router } from 'express';
import {
  assignMachineOperator,
  createMachine,
  deleteMachine,
  getAlerts,
  getMachineById,
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
router.post('/data', ingestMachineData);
router.get('/readings', getMachineReadings);
router.get('/summary', getSummary);
router.get('/alerts', getAlerts);
router.get('/:machineId/readings', getMachineReadingsById);
router.get('/:machineId', getMachineById);
router.put('/:machineId', updateMachine);
router.put('/:machineId/operator', assignMachineOperator);
router.delete('/:machineId', deleteMachine);

export default router;
