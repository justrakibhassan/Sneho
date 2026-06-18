import express from "express";
import { createPaymentIntent, confirmPayment, getPaymentHistory, } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/create-intent", protect, createPaymentIntent);
router.post("/confirm", protect, confirmPayment);
router.get("/history", protect, getPaymentHistory);
export default router;
