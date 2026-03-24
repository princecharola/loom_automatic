import { Router } from 'express';
import {
  createMachine,
  deleteMachine,
  listAlerts,
  listMachines,
  summary,
  updateMachine
} from '../controllers/machineController.js';

const router = Router();

router.get('/', listMachines);
router.post('/', createMachine);
router.put('/:id', updateMachine);
router.delete('/:id', deleteMachine);
router.get('/alerts/list', listAlerts);
router.get('/summary', summary);

export default router;
