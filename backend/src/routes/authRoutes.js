import { Router } from 'express';
import { login, me, register } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/register', authenticate, authorize(['ADMIN']), register);
router.get('/me', authenticate, me);

export default router;
