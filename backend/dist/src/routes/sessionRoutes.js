import express from "express";
import { startSession, pauseSession, resumeSession, completeSession, getSession, getSitterSessions, getParentSessions, } from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
// Session management routes
router.post("/start", protect, startSession);
router.post("/:id/pause", protect, pauseSession);
router.post("/:id/resume", protect, resumeSession);
router.post("/:id/complete", protect, completeSession);
// Get session routes
router.get("/:id", protect, getSession);
router.get("/sitter/:sitterId", protect, getSitterSessions);
router.get("/parent/:parentId", protect, getParentSessions);
export default router;
