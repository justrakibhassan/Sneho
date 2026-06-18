import express from "express";
import { saveLocation, batchSaveLocations, getSessionLocations, getLatestLocation, getSessionPath, cleanupOldLocations, } from "../controllers/locationController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
// Save location routes
router.post("/", protect, saveLocation);
router.post("/batch", protect, batchSaveLocations);
// Get location routes
router.get("/session/:sessionId", protect, getSessionLocations);
router.get("/session/:sessionId/latest", protect, getLatestLocation);
router.get("/session/:sessionId/path", protect, getSessionPath);
// Admin cleanup route
router.delete("/cleanup", protect, cleanupOldLocations);
export default router;
