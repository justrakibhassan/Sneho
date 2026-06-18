import express from "express";
import {
  startSession,
  pauseSession,
  resumeSession,
  completeSession,
  getSession,
  getSitterSessions,
  getParentSessions,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Session management routes
router.post("/start", protect as any, startSession as any);
router.post("/:id/pause", protect as any, pauseSession as any);
router.post("/:id/resume", protect as any, resumeSession as any);
router.post("/:id/complete", protect as any, completeSession as any);

// Get session routes
router.get("/:id", protect as any, getSession as any);
router.get("/sitter/:sitterId", protect as any, getSitterSessions as any);
router.get("/parent/:parentId", protect as any, getParentSessions as any);

export default router;
