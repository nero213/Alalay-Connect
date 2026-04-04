// backend/routes/passport.routes.js
import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const router = Router();

// 👉 /auth/facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] }),
);

// 👉 /auth/facebook/callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/auth/login-failed",
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      // Get complete user data from database with all fields
      const [userRows] = await pool.query(
        `SELECT u.*, 
                sp.skilled_id, 
                sp.verification_status as skilled_verification,
                sp.profile_image as skilled_profile_image,
                sp.barangay as skilled_barangay,
                sp.city as skilled_city,
                sp.latitude as skilled_latitude,
                sp.longitude as skilled_longitude,
                sp.hourly_rate,
                sp.years_experience,
                sp.bio as skilled_bio
         FROM users u
         LEFT JOIN skilled_profiles sp ON sp.user_id = u.user_id
         WHERE u.user_id = ?`,
        [user.user_id],
      );

      const fullUser = userRows[0];

      // Determine which profile image to use
      let profileImage = null;
      if (fullUser.role === "skilled" && fullUser.skilled_profile_image) {
        profileImage = fullUser.skilled_profile_image;
      } else if (fullUser.profile_image) {
        profileImage = fullUser.profile_image;
      }

      // Create complete JWT payload with all user data
      const jwtPayload = {
        user_id: fullUser.user_id,
        firstName: fullUser.firstName,
        lastName: fullUser.lastName,
        email: fullUser.email,
        role: fullUser.role,
        status: fullUser.status,
        phone: fullUser.phone || null,
        profile_image: profileImage,
        bio: fullUser.bio || fullUser.skilled_bio || null,
        barangay: fullUser.barangay || fullUser.skilled_barangay || null,
        city: fullUser.city || fullUser.skilled_city || null,
        latitude: fullUser.latitude || fullUser.skilled_latitude || null,
        longitude: fullUser.longitude || fullUser.skilled_longitude || null,
        skilled_id: fullUser.skilled_id || null,
        email_verified_at: fullUser.email_verified_at || null,
        created_at: fullUser.created_at,
        hourly_rate: fullUser.hourly_rate || null,
        years_experience: fullUser.years_experience || null,
        skilled_verification: fullUser.skilled_verification || null,
      };

      const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "7d",
      });

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/facebook-success?token=${token}`);
    } catch (error) {
      console.error("Error in Facebook callback:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=facebook_failed`);
    }
  },
);

router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "Facebook Login Failed" });
});

export default router;
  