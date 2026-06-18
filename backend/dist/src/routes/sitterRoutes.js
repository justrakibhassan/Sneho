import express from "express";
import { updateAvailability, getSitters, getSitterById, getMyAvailability, } from "../controllers/sitterController.js";
import { protect, sitterOnly } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", getSitters);
router.post("/availability", protect, sitterOnly, updateAvailability);
router.get("/availability", protect, sitterOnly, getMyAvailability);
router.get("/:id", getSitterById);
export default router;
