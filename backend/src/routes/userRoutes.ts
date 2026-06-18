import express from "express";
import {
  updateProfile,
  getUserProfile,
  getDashboardStats,
  getRecentActivity,
} from "../controllers/userController.js";
import {
  getCertifications,
  addCertification,
  deleteCertification,
} from "../controllers/certificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect as any, getUserProfile as any);
router.get("/dashboard-stats", protect as any, getDashboardStats as any);
router.get("/recent-activity", protect as any, getRecentActivity as any);

router.put("/update-profile", protect as any, updateProfile as any);

// Certification Routes
router.get("/certifications", protect as any, getCertifications as any);
router.post("/certifications", protect as any, addCertification as any);
router.delete("/certifications/:id", protect as any, deleteCertification as any);

export default router;
