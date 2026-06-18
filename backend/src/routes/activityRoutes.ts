import express from "express";
import {
  logActivity,
  getDailyReport,
  updateDailyReport,
  getSitterReports,
  getParentReports,
} from "../controllers/activityController.js";
import { protect, sitterOnly, parentOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/log", protect as any, sitterOnly as any, logActivity as any);
router.get("/report/:bookingId", protect as any, getDailyReport as any);
router.get("/reports", protect as any, sitterOnly as any, getSitterReports as any);
router.get("/parent-reports", protect as any, parentOnly as any, getParentReports as any);
router.patch("/report/:bookingId", protect as any, sitterOnly as any, updateDailyReport as any);

export default router;
