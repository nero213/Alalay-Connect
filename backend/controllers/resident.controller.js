// backend/controllers/resident.controller.js
import { pool } from "../config/db.js";

// Get resident public profile (no auth required)
export const getResidentPublicProfile = async (req, res) => {
  try {
    const { residentId } = req.params;

    const [users] = await pool.query(
      `SELECT user_id, uuid, profile_image, email, firstName, lastName, phone, 
              role, status, created_at, email_verified_at, bio, barangay, city,
              latitude, longitude
       FROM users 
       WHERE user_id = ? AND role = 'resident' AND status = 'active'`,
      [residentId],
    );

    if (!users.length) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const resident = users[0];
    resident.fullName = `${resident.firstName} ${resident.lastName}`;

    res.json({ resident });
  } catch (error) {
    console.error("Error fetching resident profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get resident ratings (no auth required)
export const getResidentRatings = async (req, res) => {
  try {
    const { residentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [ratings] = await pool.query(
      `SELECT r.*, 
              r.created_at,
              r.review,
              r.rating,
              sp.firstName as skilled_firstName, 
              sp.lastName as skilled_lastName,
              sp.profile_image as skilled_image
       FROM ratings r
       LEFT JOIN skilled_profiles sp ON sp.skilled_id = r.skilled_id
       WHERE r.client_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [residentId, parseInt(limit), offset],
    );

    // Format ratings
    const formattedRatings = ratings.map((rating) => ({
      rating_id: rating.rating_id,
      rating: rating.rating,
      review: rating.review,
      created_at: rating.created_at,
      skilled_name: rating.skilled_firstName
        ? `${rating.skilled_firstName} ${rating.skilled_lastName}`
        : null,
      skilled_image: rating.skilled_image,
    }));

    // Get total count
    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM ratings WHERE client_id = ?`,
      [residentId],
    );

    // Get stats
    const [stats] = await pool.query(
      `SELECT 
         AVG(rating) as average_rating,
         COUNT(*) as total_ratings
       FROM ratings 
       WHERE client_id = ?`,
      [residentId],
    );

    res.json({
      ratings: formattedRatings,
      stats: {
        average_rating: parseFloat(stats[0].average_rating || 0).toFixed(1),
        total_ratings: stats[0].total_ratings || 0,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit),
        hasMore: offset + ratings.length < total[0].total,
      },
    });
  } catch (error) {
    console.error("Error fetching resident ratings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get resident statistics (no auth required)
export const getResidentStats = async (req, res) => {
  try {
    const { residentId } = req.params;

    const [bookings] = await pool.query(
      `SELECT 
         COUNT(*) as total_bookings,
         SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
         SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_spent
       FROM bookings 
       WHERE client_id = ?`,
      [residentId],
    );

    res.json({
      total_bookings: bookings[0].total_bookings || 0,
      completed_bookings: bookings[0].completed_bookings || 0,
      total_spent: bookings[0].total_spent || 0,
    });
  } catch (error) {
    console.error("Error fetching resident stats:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
