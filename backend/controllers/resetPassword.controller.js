import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "../utils/email.js";

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const [users] = await pool.query(
      "SELECT user_id, email, firstName FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      // For security, don't reveal that user doesn't exist
      return res.status(200).json({
        message:
          "If your email is registered, you will receive a password reset link.",
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Delete any existing reset tokens for this user
    await pool.query("DELETE FROM password_resets WHERE user_id = ?", [
      user.user_id,
    ]);

    // Save reset token
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES (?, ?, ?)`,
      [user.user_id, resetToken, expiresAt],
    );

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, user.firstName);

    res.status(200).json({
      message:
        "If your email is registered, you will receive a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Find valid reset token
    const [resets] = await pool.query(
      `SELECT * FROM password_resets 
       WHERE token = ? AND expires_at > NOW() AND used = FALSE`,
      [token],
    );

    if (resets.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const reset = resets[0];

    // Hash new password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      reset.user_id,
    ]);

    // Mark token as used
    await pool.query(
      "UPDATE password_resets SET used = TRUE WHERE reset_id = ?",
      [reset.reset_id],
    );

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const [resets] = await pool.query(
      `SELECT * FROM password_resets 
       WHERE token = ? AND expires_at > NOW() AND used = FALSE`,
      [token],
    );

    if (resets.length === 0) {
      return res
        .status(400)
        .json({ valid: false, message: "Invalid or expired token" });
    }

    res.json({ valid: true, message: "Token is valid" });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
