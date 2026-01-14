import { Router } from "express";
import role from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  createSkilledProfile,
  getMySkilledProfile,
  uploadGovID,
  uploadCertificate,
  uploadProfileImages,
  verifySkilledProfile,
} from "../controllers/skilled.controllers.js";
import upload from "../utils/upload.js";

const router = Router();

router.post("/", verifyToken, createSkilledProfile);
router.get("/me", verifyToken, getMySkilledProfile);
router.post("/gov-id", verifyToken, upload.single("gov_id"), uploadGovID);
router.post(
  "/profile-image",
  verifyToken,
  upload.single("profile_image"),
  uploadProfileImages
);
router.post(
  "/certificate",
  verifyToken,
  upload.single("certificate"),
  uploadCertificate
);

router.patch("/:id/verify", verifyToken, role("admin"), verifySkilledProfile);

export default router;
