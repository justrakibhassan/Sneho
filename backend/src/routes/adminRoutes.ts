import express from "express";
import {
  getAdminStats,
  getPendingApprovals,
  approveSitter,
  getAllBookings,
  rejectSitter,
  getPendingSitters,
  updateBookingStatus,
  getAllUsers,
  manageUser,
  getUserById,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect as any, adminOnly as any, getAdminStats as any);
router.get("/approvals", protect as any, adminOnly as any, getPendingApprovals as any);
router.put("/approve/:id", protect as any, adminOnly as any, approveSitter as any);
router.get("/users", protect as any, adminOnly as any, getAllUsers as any);
router.patch("/users/:id", protect as any, adminOnly as any, manageUser as any);
router.get("/users/:id", protect as any, adminOnly as any, getUserById as any);
router.get("/bookings", protect as any, adminOnly as any, getAllBookings as any);
router.put("/bookings/:id", protect as any, adminOnly as any, updateBookingStatus as any);
router.get("/pending-sitters", protect as any, adminOnly as any, getPendingSitters as any);
router.put("/approve-sitter/:id", protect as any, adminOnly as any, approveSitter as any);
router.put("/reject-sitter/:id", protect as any, adminOnly as any, rejectSitter as any);

export default router;
