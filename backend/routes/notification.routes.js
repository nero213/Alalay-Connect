import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getUserNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:notification_id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.delete("/:notification_id", deleteNotification);

export default router;
