import express from "express";
import { 
  getSettings, 
  updateSettings, 
  getMaintenanceStatus 
} from "../controllers/systemController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Private admin routes
router.get("/admin/settings", protect as any, adminOnly as any, getSettings as any);
router.put("/admin/settings", protect as any, adminOnly as any, updateSettings as any);

// Public routes
router.get("/maintenance-status", getMaintenanceStatus as any);

export default router;
