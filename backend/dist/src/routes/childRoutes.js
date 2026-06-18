import express from "express";
import { addChild, getMyChildren, deleteChild, updateChild, } from "../controllers/childController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.route("/").post(protect, addChild).get(protect, getMyChildren);
router.route("/:id").delete(protect, deleteChild).put(protect, updateChild);
export default router;
