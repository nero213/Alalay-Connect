import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import upload from "../utils/upload.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updateNotificationSettings,
  uploadProfileImage,
  requestPasswordReset,
  resetPassword,
  deleteAccount,
  getUserRecentActivity,
  getUserActivityLogs,
  getUserStats,
} from "../controllers/userSetting.controllers.js";

const router = Router();

// All routes require authentication except password reset
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/password", verifyToken, changePassword);
router.put("/settings", verifyToken, updateNotificationSettings);
router.post(
  "/profile-image",
  verifyToken,
  upload.single("profile_image"),
  uploadProfileImage,
);
router.delete("/account", verifyToken, deleteAccount);

// Public routes for password reset
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/recent-activity", verifyToken, getUserRecentActivity);
// backend/routes/userSetting.routes.js
// Add these routes
router.get("/activity-logs", verifyToken, getUserActivityLogs);
router.get("/stats", verifyToken, getUserStats);

export default router;
