import { Router } from "express";
import {
  addSkillsToProfile,
  removeSkillFromProfile,
  getMyskills,
<<<<<<< HEAD
=======
  getAllSkills,
>>>>>>> backend
} from "../controllers/skill.controllers.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, addSkillsToProfile);
<<<<<<< HEAD
=======
router.get("/all",  getAllSkills);
>>>>>>> backend
router.get("/me", verifyToken, getMyskills);
router.delete("/:skillId", verifyToken, removeSkillFromProfile);
export default router;
