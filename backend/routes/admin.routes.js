import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getPendingSkilledProfiles,
  getSkilledProfileById,
  verifySkilledProfile,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getReportedRatings,
  resolveReport,
  getAdminProfile,
} from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:user_id/status", updateUserStatus);

// Skilled Profile Verification
router.get("/profiles/pending", getPendingSkilledProfiles);
router.get("/profiles/:id", getSkilledProfileById);
router.put("/profiles/:id/verify", verifySkilledProfile);

// Skill Management
router.get("/skills", getAllSkills);
router.post("/skills", createSkill);
router.put("/skills/:id", updateSkill);
router.delete("/skills/:id", deleteSkill);

// Reported Content
router.get("/reports", getReportedRatings);
router.put("/reports/:id/resolve", resolveReport);
router.get("/profile", getAdminProfile);

export default router;
