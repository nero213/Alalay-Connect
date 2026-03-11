// Verify email with code
import { pool } from "../config/db.js";
import {
  generateVerificationCode,
  sendWelcomeEmail,
  sendVerificationEmail,
} from "../utils/email.js"; // IMPORT THESE!

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and verification code are required" });
    }

    // Find user with this email and valid verification token
    const [users] = await pool.query(
      `SELECT * FROM users 
       WHERE email = ? 
       AND verification_token = ? 
       AND verification_token_expires > NOW()
       AND status = 'pending'`,
      [email, code],
    );

    if (users.length === 0) {
      return res.status(400).json({
        message:
          "Invalid or expired verification code. Please request a new one.",
      });
    }

    const user = users[0];

    // Update user as verified
    await pool.query(
      `UPDATE users 
       SET status = 'active', 
           email_verified_at = NOW(),
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE user_id = ?`,
      [user.user_id],
    );

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    res.json({
      message: "Email verified successfully! Your account is now active.",
      verified: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

// Resend verification code
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user with pending status
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND status = 'pending'",
      [email],
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "No pending verification found for this email",
      });
    }

    const user = users[0];

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new code
    await pool.query(
      `UPDATE users 
       SET verification_token = ?, verification_token_expires = ?
       WHERE user_id = ?`,
      [verificationCode, expiresAt, user.user_id],
    );

    // Send new verification email
    await sendVerificationEmail(email, verificationCode);

    res.json({
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};
