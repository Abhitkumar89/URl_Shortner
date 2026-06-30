import { Router } from 'express';
import { googleAuth, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
