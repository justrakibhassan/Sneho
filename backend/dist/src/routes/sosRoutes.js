import express from "express";
import { createSOS, getSOSAlerts, resolveSOS, } from "../controllers/sosController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/", protect, createSOS);
router.get("/", protect, adminOnly, getSOSAlerts);
router.put("/:id/resolve", protect, adminOnly, resolveSOS);
export default router;
