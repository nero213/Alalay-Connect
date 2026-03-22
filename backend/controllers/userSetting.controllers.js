// backend/controllers/userSetting.controllers.js
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Get user profile with settings - UPDATED with bio and location
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details - INCLUDING bio, barangay, city
    const [users] = await pool.query(
      `SELECT user_id, uuid, email, firstName, lastName, phone, role, status, 
              created_at, profile_image, bio, barangay, city
       FROM users WHERE user_id = ?`,
      [userId],
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user settings
    const [settings] = await pool.query(
      "SELECT * FROM user_settings WHERE user_id = ?",
      [userId],
    );

    // If no settings exist, create default settings
    if (!settings.length) {
      await pool.query(`INSERT INTO user_settings (user_id) VALUES (?)`, [
        userId,
      ]);

      // Fetch the newly created settings
      const [newSettings] = await pool.query(
        "SELECT * FROM user_settings WHERE user_id = ?",
        [userId],
      );

      res.json({
        user: users[0],
        settings: newSettings[0],
      });
    } else {
      res.json({
        user: users[0],
        settings: settings[0],
      });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update user profile (basic info) - UPDATED with bio and location
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, bio, barangay, city } = req.body;

    // Check if phone number is taken by another user (only if phone is provided)
    if (phone) {
      const [rows] = await pool.query(
        "SELECT user_id FROM users WHERE phone = ? AND user_id != ?",
        [phone, userId],
      );

      if (rows.length > 0) {
        return res.status(400).json({ message: "Phone number already taken" });
      }
    }

    // Update user info with bio and location
    await pool.query(
      `UPDATE users 
       SET firstName = ?, lastName = ?, phone = ?, bio = ?, barangay = ?, city = ?
       WHERE user_id = ?`,
      [
        firstName,
        lastName,
        phone || null,
        bio || null,
        barangay || null,
        city || null,
        userId,
      ],
    );

    // Fetch updated user
    const [users] = await pool.query(
      `SELECT user_id, uuid, email, firstName, lastName, phone, role, status, 
              created_at, profile_image, bio, barangay, city
       FROM users WHERE user_id = ?`,
      [userId],
    );

    res.json({
      message: "Profile updated successfully",
      user: users[0],
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Change password - KEEP AS IS
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Get user's current password
    const [users] = await pool.query(
      "SELECT password FROM users WHERE user_id = ?",
      [userId],
    );

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update notification settings - KEEP AS IS
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      email_notifications,
      push_notifications,
      sms_notifications,
      language,
      theme,
    } = req.body;

    // Check if settings exist
    const [existing] = await pool.query(
      "SELECT * FROM user_settings WHERE user_id = ?",
      [userId],
    );

    if (existing.length) {
      // Update existing settings
      await pool.query(
        `UPDATE user_settings 
         SET email_notifications = ?, push_notifications = ?, 
             sms_notifications = ?, language = ?, theme = ?
         WHERE user_id = ?`,
        [
          email_notifications ?? true,
          push_notifications ?? true,
          sms_notifications ?? false,
          language || "en",
          theme || "light",
          userId,
        ],
      );
    } else {
      // Insert new settings
      await pool.query(
        `INSERT INTO user_settings 
         (user_id, email_notifications, push_notifications, sms_notifications, language, theme) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          email_notifications ?? true,
          push_notifications ?? true,
          sms_notifications ?? false,
          language || "en",
          theme || "light",
        ],
      );
    }

    // Fetch updated settings
    const [settings] = await pool.query(
      "SELECT * FROM user_settings WHERE user_id = ?",
      [userId],
    );

    res.json({
      message: "Settings updated successfully",
      settings: settings[0],
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Upload profile image - KEEP AS IS
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const imageUrl = `/uploads/${req.file.filename}`;

    await pool.query("UPDATE users SET profile_image = ? WHERE user_id = ?", [
      imageUrl,
      userId,
    ]);

    res.json({
      message: "Profile image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Request password reset - KEEP AS IS
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const [users] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email],
    );

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await pool.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE token = ?, expires_at = ?, used = FALSE`,
      [users[0].user_id, resetToken, expiresAt, resetToken, expiresAt],
    );

    // TODO: Send email with reset link
    res.json({
      message: "Password reset email sent",
      resetToken: resetToken, // Remove in production!
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Reset password with token - KEEP AS IS
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find valid reset token
    const [resets] = await pool.query(
      `SELECT * FROM password_resets 
       WHERE token = ? AND expires_at > NOW() AND used = FALSE`,
      [token],
    );

    if (!resets.length) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await pool.query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedPassword,
      resets[0].user_id,
    ]);

    // Mark token as used
    await pool.query(
      "UPDATE password_resets SET used = TRUE WHERE reset_id = ?",
      [resets[0].reset_id],
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete account - KEEP AS IS
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    // Verify password
    const [users] = await pool.query(
      "SELECT password FROM users WHERE user_id = ?",
      [userId],
    );

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user (cascading will delete related records)
    await pool.query("DELETE FROM users WHERE user_id = ?", [userId]);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
