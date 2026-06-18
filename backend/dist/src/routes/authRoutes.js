import express from "express";
import { registerUser, loginUser, registerSitter, applyAsSitter, forgotPassword, resetPassword, } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
// POST: /api/auth/register
router.post("/register", registerUser);
// POST: /api/auth/login
router.post("/login", loginUser);
// POST: /api/auth/register-sitter (for new users)
router.post("/register-sitter", registerSitter);
// POST: /api/auth/apply-as-sitter (for existing users) - Protected
router.post("/apply-as-sitter", protect, applyAsSitter);
// POST: /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);
// POST: /api/auth/reset-password
router.post("/reset-password", resetPassword);
export default router;
