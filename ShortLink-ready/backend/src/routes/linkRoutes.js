import { Router } from 'express';
import {
  createLink,
  getLinks,
  deleteLink,
  getAnalytics,
  getQrCode,
} from '../controllers/linkController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// All link routes require authentication.
router.use(protect);

router.post('/shorten', createLink);
router.get('/links', getLinks);
router.delete('/links/:id', deleteLink);
router.get('/links/:id/qr', getQrCode);
router.get('/analytics/:id', getAnalytics);

export default router;
