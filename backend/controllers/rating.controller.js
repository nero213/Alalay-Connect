import { pool } from "../config/db.js";

// Submit a rating
export const submitRating = async (req, res) => {
  try {
    const { skilled_id, rating, review, booking_id } = req.body;
    const client_id = req.user.id;

    // Validate rating
    if (!skilled_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Valid skilled_id and rating (1-5) are required",
      });
    }

    // Check if skilled profile exists
    const [skilled] = await pool.query(
      "SELECT * FROM skilled_profiles WHERE skilled_id = ?",
      [skilled_id],
    );

    if (!skilled.length) {
      return res
        .status(404)
        .json({ message: "Skilled professional not found" });
    }

    // Check if client has already rated this skilled worker
    const [existing] = await pool.query(
      "SELECT rating_id FROM ratings WHERE skilled_id = ? AND client_id = ?",
      [skilled_id, client_id],
    );

    if (existing.length > 0) {
      // Update existing rating
      await pool.query(
        `UPDATE ratings 
         SET rating = ?, review = ?, updated_at = NOW() 
         WHERE skilled_id = ? AND client_id = ?`,
        [rating, review, skilled_id, client_id],
      );

      // Get the updated rating
      const [updated] = await pool.query(
        `SELECT r.*, u.firstName, u.lastName 
         FROM ratings r
         JOIN users u ON u.user_id = r.client_id
         WHERE r.skilled_id = ? AND r.client_id = ?`,
        [skilled_id, client_id],
      );

      return res.json({
        message: "Rating updated successfully",
        rating: updated[0],
      });
    } else {
      // Insert new rating
      const [result] = await pool.query(
        `INSERT INTO ratings (skilled_id, client_id, booking_id, rating, review) 
         VALUES (?, ?, ?, ?, ?)`,
        [skilled_id, client_id, booking_id || null, rating, review],
      );

      // Get the newly created rating
      const [newRating] = await pool.query(
        `SELECT r.*, u.firstName, u.lastName 
         FROM ratings r
         JOIN users u ON u.user_id = r.client_id
         WHERE r.rating_id = ?`,
        [result.insertId],
      );

      res.status(201).json({
        message: "Rating submitted successfully",
        rating: newRating[0],
      });
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get ratings for a specific skilled worker
export const getSkilledRatings = async (req, res) => {
  try {
    const { skilled_id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get ratings with pagination
    const [ratings] = await pool.query(
      `SELECT 
        r.*,
        u.firstName,
        u.lastName,
        u.profile_image as client_image,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as created_at
       FROM ratings r
       JOIN users u ON u.user_id = r.client_id
       WHERE r.skilled_id = ? AND r.status = 'active'
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [skilled_id, parseInt(limit), offset],
    );

    // Get rating statistics
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM ratings
       WHERE skilled_id = ? AND status = 'active'`,
      [skilled_id],
    );

    // Calculate percentages
    const total = stats[0].total_ratings || 0;
    const ratingStats = {
      total_ratings: total,
      average_rating: parseFloat(stats[0].average_rating || 0).toFixed(1),
      distribution: {
        5: {
          count: stats[0].five_star || 0,
          percentage: total
            ? Math.round((stats[0].five_star / total) * 100)
            : 0,
        },
        4: {
          count: stats[0].four_star || 0,
          percentage: total
            ? Math.round((stats[0].four_star / total) * 100)
            : 0,
        },
        3: {
          count: stats[0].three_star || 0,
          percentage: total
            ? Math.round((stats[0].three_star / total) * 100)
            : 0,
        },
        2: {
          count: stats[0].two_star || 0,
          percentage: total ? Math.round((stats[0].two_star / total) * 100) : 0,
        },
        1: {
          count: stats[0].one_star || 0,
          percentage: total ? Math.round((stats[0].one_star / total) * 100) : 0,
        },
      },
    };

    res.json({
      ratings,
      stats: ratingStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: ratings.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Check if user has already rated
export const checkUserRating = async (req, res) => {
  try {
    const { skilled_id } = req.params;
    const client_id = req.user.id;

    const [rating] = await pool.query(
      `SELECT * FROM ratings 
       WHERE skilled_id = ? AND client_id = ?`,
      [skilled_id, client_id],
    );

    res.json({
      hasRated: rating.length > 0,
      rating: rating[0] || null,
    });
  } catch (error) {
    console.error("Error checking rating:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete a rating (only by the user who created it)
export const deleteRating = async (req, res) => {
  try {
    const { rating_id } = req.params;
    const user_id = req.user.id;

    // Check if rating exists and belongs to user
    const [rating] = await pool.query(
      "SELECT * FROM ratings WHERE rating_id = ? AND client_id = ?",
      [rating_id, user_id],
    );

    if (!rating.length) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Soft delete - set status to 'removed'
    await pool.query(
      "UPDATE ratings SET status = 'removed' WHERE rating_id = ?",
      [rating_id],
    );

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
