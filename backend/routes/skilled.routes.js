import { Router } from "express";
import role from "../middleware/role.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";

import {
  updateProfileImage,
  updateContactInfo,
  updateBio,
  getCompleteSkilledProfile,
  createSkilledProfile,
  getMySkilledProfile,
  uploadGovID,
  uploadCertificate,
  uploadProfileImages,
  verifySkilledProfile,
  updateSkilledLocation,
  searchSkilledWorkers,
  getSkilledUsers,
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
  uploadProfileImages,
);

router.post(
  "/certificate",
  verifyToken,
  upload.single("certificate"),
  uploadCertificate,
);
router.put("/location", verifyToken, updateSkilledLocation);
router.get("/all", getSkilledUsers);
router.get("/search", searchSkilledWorkers);
router.get("/profile/complete", verifyToken, getCompleteSkilledProfile);
router.patch("/:id/verify", verifyToken, role("admin"), verifySkilledProfile);
router.put("/bio", verifyToken, updateBio);
router.put(
  "/profile-image",
  verifyToken,
  upload.single("profile_image"),
  updateProfileImage,
);
router.put("/contact", verifyToken, updateContactInfo);

export default router;
