import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  toggleFavorite,
  getFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";

const router = express.Router();

router.use(protect);

router.post("/toggle", toggleFavorite);
router.get("/", getFavorites);
router.get("/check/:babysitterId", checkFavorite);

export default router;
