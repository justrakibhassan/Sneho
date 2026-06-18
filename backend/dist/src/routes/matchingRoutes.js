import express from 'express';
import { getMatchingSitters } from '../controllers/matchingController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/find-sitters', protect, getMatchingSitters);
export default router;
