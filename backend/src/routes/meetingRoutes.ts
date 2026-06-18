import express from "express";
import { generateMeetingToken } from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/token", protect as any, generateMeetingToken as any);

export default router;
