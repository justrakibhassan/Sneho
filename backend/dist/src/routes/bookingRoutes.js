import express from "express";
import { createBooking, getMyBookings, updateBookingStatus, startSession, endSession, logGPS, updateMeetingLink, getSitterEarnings, addTip, } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.patch("/:id/link", protect, updateMeetingLink);
router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.get("/earnings", protect, getSitterEarnings);
router.get("/my-bookings", protect, getMyBookings); // Alias for frontend
router.patch("/:id", protect, updateBookingStatus);
router.put("/sitter-action/:id", protect, updateBookingStatus); // Match frontend PUT
router.patch("/sitter-action/:id", protect, updateBookingStatus); // Alias for flexibility
// Session Routes
router.post("/:id/start", protect, startSession);
router.post("/:id/end", protect, endSession);
router.post("/:id/gps", protect, logGPS);
router.patch("/:id/link", protect, updateMeetingLink);
router.post("/:id/tip", protect, addTip);
export default router;
