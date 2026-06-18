import express from "express";
import { getSettings, updateSettings, getMaintenanceStatus } from "../controllers/systemController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
const router = express.Router();
// Private admin routes
router.get("/admin/settings", protect, adminOnly, getSettings);
router.put("/admin/settings", protect, adminOnly, updateSettings);
// Public routes
router.get("/maintenance-status", getMaintenanceStatus);
export default router;
