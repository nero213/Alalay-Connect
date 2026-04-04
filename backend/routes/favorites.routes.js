import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
} from "../controllers/favorites.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.post("/", addToFavorites);
router.delete("/:skilled_id", removeFromFavorites);
router.get("/", getFavorites);
router.get("/check/:skilled_id", checkFavorite);

export default router;
