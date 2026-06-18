import express from "express";
import {
  getContacts,
  addContact,
  updateContact,
  deleteContact,
} from "../controllers/emergencyContactController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect as any, getContacts as any).post(protect as any, addContact as any);

router
  .route("/:id")
  .put(protect as any, updateContact as any)
  .delete(protect as any, deleteContact as any);

export default router;
