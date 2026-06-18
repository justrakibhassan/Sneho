import express from "express";
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  startSession,
  endSession,
  logGPS,
  updateMeetingLink,
  getSitterEarnings,
  addTip,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.patch("/:id/link", protect as any, updateMeetingLink as any);

router.post("/", protect as any, createBooking as any);
router.get("/", protect as any, getMyBookings as any);
router.get("/earnings", protect as any, getSitterEarnings as any);
router.get("/my-bookings", protect as any, getMyBookings as any); // Alias for frontend
router.patch("/:id", protect as any, updateBookingStatus as any);
router.put("/sitter-action/:id", protect as any, updateBookingStatus as any); // Match frontend PUT
router.patch("/sitter-action/:id", protect as any, updateBookingStatus as any); // Alias for flexibility

// Session Routes
router.post("/:id/start", protect as any, startSession as any);
router.post("/:id/end", protect as any, endSession as any);
router.post("/:id/gps", protect as any, logGPS as any);
router.patch("/:id/link", protect as any, updateMeetingLink as any);
router.post("/:id/tip", protect as any, addTip as any);

export default router;
