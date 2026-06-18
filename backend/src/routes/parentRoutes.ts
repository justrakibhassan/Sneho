import express from "express";
import { getParentById } from "../controllers/parentController.js";

const router = express.Router();

router.get("/:id", getParentById as any);

export default router;
