import express from "express";
import {
  createReview,
  getSitterReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect as any, createReview as any);
router.get("/sitter/:id", getSitterReviews as any);

export default router;
