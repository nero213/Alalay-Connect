import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

// 🛡️ Middleware to bypass ngrok warning page

// 👉 /auth/facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// 👉 /auth/facebook/callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login-failed",
    session: false,
  }),
  (req, res) => {
    const jwtPayload = {
      user_id: req.user.user_id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    };
    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    res.redirect(`${process.env.FRONTEND_URL}/facebook-success?token=${token}`);
  }
);

router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Facebook Login Failed" });
});

export default router;
