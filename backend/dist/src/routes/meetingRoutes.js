import express from "express";
import { generateMeetingToken } from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/token", protect, generateMeetingToken);
export default router;
