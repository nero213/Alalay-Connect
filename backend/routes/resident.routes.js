// backend/routes/resident.routes.js
import { Router } from "express";
import {
  getResidentPublicProfile,
  getResidentRatings,
  getResidentStats,
} from "../controllers/resident.controller.js";

const router = Router();

// Public routes - no authentication required
router.get("/:residentId/public", getResidentPublicProfile);
router.get("/:residentId/ratings", getResidentRatings);
router.get("/:residentId/stats", getResidentStats);

export default router;
