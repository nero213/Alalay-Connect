import express from "express";
import { registerValidators } from "../auth/authvalidator.js";
import { userRegister } from "../auth/register.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { loginValidators } from "../auth/authvalidator.js";
import { userLogin } from "../auth/login.js";
import { resendVerificationCode, verifyEmail } from "../auth/verifyEmail.js";
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/resetPassword.controller.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
    retryAfter: Math.ceil(15 * 60), // 900 seconds
  },
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res, next, options) => {
    // Custom handler for rate limit exceeded
    res.status(429).json({
      message:
        options.message.message || "Too many requests, please try again later.",
      retryAfter: Math.ceil(options.windowMs / 1000),
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
  handler: (req, res, next, options) => {
    res.status(429).json({
      message:
        options.message.message || "Too many requests, please try again later.",
    });
  },
});
// this is the route where my registration happens
router.post("/register", authLimiter, registerValidators, userRegister);
router.post("/login", loginLimiter, loginValidators, userLogin);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);

router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);

router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Authorized", user: req.user });
});

// router.get("/register/testing", (req, res) => {
//   res.json({ hello: "world" });
// });

export default router;
