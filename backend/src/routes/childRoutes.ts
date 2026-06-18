import express from "express";
import {
  addChild,
  getMyChildren,
  deleteChild,
  updateChild,
} from "../controllers/childController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect as any, addChild as any).get(protect as any, getMyChildren as any);

router.route("/:id").delete(protect as any, deleteChild as any).put(protect as any, updateChild as any);

export default router;
