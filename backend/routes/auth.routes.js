import express from "express";
import { registerValidators } from "../auth/authvalidator.js";
import { userRegister } from "../auth/register.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { loginValidators } from "../auth/authvalidator.js";
import { userLogin } from "../auth/login.js";

const router = express.Router();

// this is the route where my registration happens
router.post("/register", registerValidators, userRegister);
router.post("/login", loginValidators, userLogin);

router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Authorized", user: req.user });
});

// router.get("/register/testing", (req, res) => {
//   res.json({ hello: "world" });
// });

export default router;
