import express from "express";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-intent", protect as any, createPaymentIntent as any);
router.post("/confirm", protect as any, confirmPayment as any);
router.get("/history", protect as any, getPaymentHistory as any);

export default router;
