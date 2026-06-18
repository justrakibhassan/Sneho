import express from "express";
import {
  saveLocation,
  batchSaveLocations,
  getSessionLocations,
  getLatestLocation,
  getSessionPath,
  cleanupOldLocations,
} from "../controllers/locationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Save location routes
router.post("/", protect as any, saveLocation as any);
router.post("/batch", protect as any, batchSaveLocations as any);

// Get location routes
router.get("/session/:sessionId", protect as any, getSessionLocations as any);
router.get("/session/:sessionId/latest", protect as any, getLatestLocation as any);
router.get("/session/:sessionId/path", protect as any, getSessionPath as any);

// Admin cleanup route
router.delete("/cleanup", protect as any, cleanupOldLocations as any);

export default router;
