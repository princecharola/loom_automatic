import { Router } from 'express';
import {
  addMachine,
  deleteMachine,
  listAlerts,
  listMachines,
  updateMachine
} from '../controllers/machineController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/machines', listMachines);
router.post('/machines', addMachine);
router.put('/machines/:id', updateMachine);
router.delete('/machines/:id', deleteMachine);
router.get('/alerts', listAlerts);

export default router;
