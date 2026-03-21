import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Conversations
router.get("/conversations", getUserConversations);
router.get("/conversations/:skilled_id", getOrCreateConversation);
router.get("/conversations/:conversation_id/messages", getMessages);
router.put("/conversations/:conversation_id/read", markAsRead);

// Messages with file upload support
router.post("/send", upload.single("message_file"), sendMessage);
router.delete("/messages/:message_id", deleteMessage);

// Unread count
router.get("/unread", getUnreadCount);

export default router;
