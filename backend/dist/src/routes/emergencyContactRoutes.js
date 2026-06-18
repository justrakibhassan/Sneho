import express from "express";
import { getContacts, addContact, updateContact, deleteContact, } from "../controllers/emergencyContactController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();
router.route("/").get(protect, getContacts).post(protect, addContact);
router
    .route("/:id")
    .put(protect, updateContact)
    .delete(protect, deleteContact);
export default router;
