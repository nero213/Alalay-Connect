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

// backend/controllers/user.controller.js
export const getUserRecentActivity = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { limit = 5 } = req.query;

    const [activities] = await pool.query(
      `SELECT 
        b.booking_id as id,
        'booking' as type,
        'New Booking' as title,
        b.created_at
       FROM bookings b
       WHERE b.client_id = ?
       UNION ALL
       SELECT 
        r.rating_id as id,
        'review' as type,
        'New Review' as title,
        r.created_at
       FROM ratings r
       WHERE r.client_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [user_id, user_id, parseInt(limit)],
    );

    res.json({ activities });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// backend/controllers/user.controller.js
// Add these functions to your existing user controller

// Get user activity logs
export const getUserActivityLogs = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get bookings activity
    const [bookings] = await pool.query(
      `SELECT 
        b.booking_id as id,
        'booking' as type,
        'Booking Created' as title,
        CONCAT('You booked ', sp.firstName, ' ', sp.lastName) as description,
        JSON_OBJECT(
          'booking_id', b.booking_id,
          'skilled_name', CONCAT(sp.firstName, ' ', sp.lastName),
          'service_date', b.service_date,
          'duration', b.duration,
          'amount', b.total_amount,
          'status', b.status
        ) as details,
        b.created_at
       FROM bookings b
       JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
       WHERE b.client_id = ?
       UNION ALL
       
       -- Get reviews activity
       SELECT 
        r.rating_id as id,
        'review' as type,
        'Review Submitted' as title,
        CONCAT('You reviewed ', sp.firstName, ' ', sp.lastName) as description,
        JSON_OBJECT(
          'rating', r.rating,
          'review', r.review,
          'skilled_name', CONCAT(sp.firstName, ' ', sp.lastName),
          'booking_id', r.booking_id
        ) as details,
        r.created_at
       FROM ratings r
       JOIN skilled_profiles sp ON sp.skilled_id = r.skilled_id
       WHERE r.client_id = ?
       
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, user_id, parseInt(limit), offset],
    );

    // Get total count
    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM (
         SELECT booking_id FROM bookings WHERE client_id = ?
         UNION ALL
         SELECT rating_id FROM ratings WHERE client_id = ?
       ) as combined`,
      [user_id, user_id],
    );

    // Format activities with proper details parsing
    const activities = bookings.map((activity) => ({
      ...activity,
      details:
        typeof activity.details === "string"
          ? JSON.parse(activity.details)
          : activity.details,
    }));

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        hasMore: offset + activities.length < total[0].total,
      },
    });
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [bookings] = await pool.query(
      `SELECT 
         COUNT(*) as total_bookings,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
         SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_spent
       FROM bookings 
       WHERE client_id = ?`,
      [user_id],
    );

    const [reviews] = await pool.query(
      `SELECT COUNT(*) as total_reviews FROM ratings WHERE client_id = ?`,
      [user_id],
    );

    res.json({
      total_bookings: bookings[0].total_bookings || 0,
      completed_bookings: bookings[0].completed_bookings || 0,
      total_spent: bookings[0].total_spent || 0,
      total_reviews: reviews[0].total_reviews || 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
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
