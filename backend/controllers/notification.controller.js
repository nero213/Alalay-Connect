import { pool } from "../config/db.js";

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;

    const params = [user_id];

    if (unreadOnly === "true") {
      query += ` AND is_read = FALSE`;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [notifications] = await pool.query(query, params);

    // Get unread count
    const [[{ unread_count }]] = await pool.query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [user_id],
    );

    // Get total count
    const [[{ total_count }]] = await pool.query(
      `SELECT COUNT(*) as total_count 
       FROM notifications 
       WHERE user_id = ?`,
      [user_id],
    );

    res.json({
      notifications,
      unread_count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total_count,
        hasMore: offset + notifications.length < total_count,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const user_id = req.user.id;

    const [result] = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE notification_id = ? AND user_id = ?`,
      [notification_id, user_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.id;

    await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE user_id = ? AND is_read = FALSE`,
      [user_id],
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const user_id = req.user.id;

    const [result] = await pool.query(
      "DELETE FROM notifications WHERE notification_id = ? AND user_id = ?",
      [notification_id, user_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [[{ unread_count }]] = await pool.query(
      `SELECT COUNT(*) as unread_count 
       FROM notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [user_id],
    );

    res.json({ unread_count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
