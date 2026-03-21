import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  createReport,
  getAllReports,
  getReportById,
  resolveReport,
  getReportStats,
} from "../controllers/report.controller.js";

const router = Router();

// User routes (require auth)
router.post("/", verifyToken, createReport);

// Admin routes (require admin role)
router.get("/admin", verifyToken, isAdmin, getAllReports);
router.get("/admin/stats", verifyToken, isAdmin, getReportStats);
router.get("/admin/:id", verifyToken, isAdmin, getReportById);
router.put("/admin/:id/resolve", verifyToken, isAdmin, resolveReport);

export default router;
