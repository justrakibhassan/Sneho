import express from "express";
import { createReview, getSitterReviews, } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/", protect, createReview);
router.get("/sitter/:id", getSitterReviews);
export default router;
