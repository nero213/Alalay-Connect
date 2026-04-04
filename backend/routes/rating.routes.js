import { Router } from "express";
import {
  submitRating,
  getSkilledRatings,
  checkUserRating,
  deleteRating,
} from "../controllers/rating.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/skilled/:skilled_id", getSkilledRatings);

// Protected routes
router.post("/", verifyToken, submitRating);
router.get("/check/:skilled_id", verifyToken, checkUserRating);
router.delete("/:rating_id", verifyToken, deleteRating);

export default router;
