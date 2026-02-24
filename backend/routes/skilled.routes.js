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
<<<<<<< HEAD
=======
  updateSkilledLocation,
  searchSkilledWorkers,
  getSkilledUsers,
>>>>>>> backend
} from "../controllers/skilled.controllers.js";
import upload from "../utils/upload.js";

const router = Router();

router.post("/", verifyToken, createSkilledProfile);
router.get("/me", verifyToken, getMySkilledProfile);
<<<<<<< HEAD
router.post(
  "/gov-id", 
  verifyToken, 
  upload.single("gov_id"), 
  uploadGovID
);
=======
router.post("/gov-id", verifyToken, upload.single("gov_id"), uploadGovID);
>>>>>>> backend
router.post(
  "/profile-image",
  verifyToken,
  upload.single("profile_image"),
<<<<<<< HEAD
  uploadProfileImages
=======
  uploadProfileImages,
>>>>>>> backend
);
router.post(
  "/certificate",
  verifyToken,
  upload.single("certificate"),
<<<<<<< HEAD
  uploadCertificate
);

=======
  uploadCertificate,
);
router.put("/location", verifyToken, updateSkilledLocation);
router.get("/all", getSkilledUsers);
router.get("/search", searchSkilledWorkers);
>>>>>>> backend
router.patch("/:id/verify", verifyToken, role("admin"), verifySkilledProfile);

export default router;
