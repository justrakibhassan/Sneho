import express from "express";
import {
  createSOS,
  getSOSAlerts,
  resolveSOS,
} from "../controllers/sosController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect as any, createSOS as any);
router.get("/", protect as any, adminOnly as any, getSOSAlerts as any);
router.put("/:id/resolve", protect as any, adminOnly as any, resolveSOS as any);

export default router;
