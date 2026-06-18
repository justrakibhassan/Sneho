import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  getStreamChatToken,
  createOrGetConversation,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/token", protect as any, getStreamChatToken as any);
router.get("/conversations", protect as any, getConversations as any);
router.post("/conversation", protect as any, createOrGetConversation as any);
router.get("/:bookingId", protect as any, getMessages as any);
router.post("/", protect as any, sendMessage as any);

export default router;
