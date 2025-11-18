import express from "express";
import { registerValidators } from "../auth/authvalidator.js";
import { userRegister } from "../auth/register.js";
import { userLogin } from "../auth/login.js";

const router = express.Router();

// this is the route where my registration happens
router.post("/register", registerValidators, userRegister);
router.post("/login", userLogin);

// router.get("/register/testing", (req, res) => {
//   res.json({ hello: "world" });
// });

export default router;
