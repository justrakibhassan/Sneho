import express from "express";
import {
  updateAvailability,
  getSitters,
  getSitterById,
  getMyAvailability,
} from "../controllers/sitterController.js";
import { protect, sitterOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSitters as any);
router.post("/availability", protect as any, sitterOnly as any, updateAvailability as any);
router.get("/availability", protect as any, sitterOnly as any, getMyAvailability as any);
router.get("/:id", getSitterById as any);

export default router;
