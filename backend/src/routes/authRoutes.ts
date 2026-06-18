import express from "express";
import {
  registerUser,
  loginUser,
  registerSitter,
  applyAsSitter,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST: /api/auth/register
router.post("/register", registerUser as any);

// POST: /api/auth/login
router.post("/login", loginUser as any);

// POST: /api/auth/register-sitter (for new users)
router.post("/register-sitter", registerSitter as any);

// POST: /api/auth/apply-as-sitter (for existing users) - Protected
router.post("/apply-as-sitter", protect as any, applyAsSitter as any);

// POST: /api/auth/forgot-password
router.post("/forgot-password", forgotPassword as any);

// POST: /api/auth/reset-password
router.post("/reset-password", resetPassword as any);

export default router;
