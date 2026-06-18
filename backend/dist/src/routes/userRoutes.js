import express from "express";
import { updateProfile, getUserProfile, getDashboardStats, getRecentActivity, } from "../controllers/userController.js";
import { getCertifications, addCertification, deleteCertification, } from "../controllers/certificationController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/profile", protect, getUserProfile);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/recent-activity", protect, getRecentActivity);
router.put("/update-profile", protect, updateProfile);
// Certification Routes
router.get("/certifications", protect, getCertifications);
router.post("/certifications", protect, addCertification);
router.delete("/certifications/:id", protect, deleteCertification);
export default router;
