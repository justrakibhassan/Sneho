import express from 'express';
import { getMatchingSitters } from '../controllers/matchingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/find-sitters', protect as any, getMatchingSitters as any);

export default router;
