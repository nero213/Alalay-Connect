import { pool } from "../config/db.js";

// Add to favorites
export const addToFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { skilled_id } = req.body;

    if (!skilled_id) {
      return res.status(400).json({ message: "Skilled ID is required" });
    }

    // Check if skilled profile exists
    const [skilled] = await pool.query(
      "SELECT skilled_id FROM skilled_profiles WHERE skilled_id = ?",
      [skilled_id],
    );

    if (!skilled.length) {
      return res
        .status(404)
        .json({ message: "Skilled professional not found" });
    }

    // Check if already in favorites
    const [existing] = await pool.query(
      "SELECT * FROM favorites WHERE user_id = ? AND skilled_id = ?",
      [user_id, skilled_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    // Add to favorites
    await pool.query(
      "INSERT INTO favorites (user_id, skilled_id) VALUES (?, ?)",
      [user_id, skilled_id],
    );

    res.status(201).json({
      message: "Added to favorites successfully",
      skilled_id,
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { skilled_id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM favorites WHERE user_id = ? AND skilled_id = ?",
      [user_id, skilled_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.json({
      message: "Removed from favorites successfully",
      skilled_id,
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user's favorites with skilled profile details
// Get user's favorites with skilled profile details
// Get user's favorites with skilled profile details
export const getFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [favorites] = await pool.query(
      `SELECT 
        f.*,
        sp.skilled_id,
        sp.firstName,
        sp.lastName,
        sp.bio,
        sp.years_experience,
        sp.hourly_rate,
        sp.profile_image,
        sp.verification_status,
        (SELECT AVG(rating) FROM ratings WHERE skilled_id = sp.skilled_id) as average_rating,
        (SELECT COUNT(*) FROM ratings WHERE skilled_id = sp.skilled_id) as total_ratings,
        (SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
         FROM skilled_profile_skills sps
         JOIN skills s ON s.skill_id = sps.skill_id
         WHERE sps.skilled_id = sp.skilled_id) as skill_names
      FROM favorites f
      JOIN skilled_profiles sp ON sp.skilled_id = f.skilled_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`,
      [user_id],
    );

    const formatted = favorites.map((fav) => ({
      favorite_id: fav.favorite_id,
      skilled_id: fav.skilled_id,
      fullName: `${fav.firstName} ${fav.lastName}`,
      profile_image: fav.profile_image,
      bio: fav.bio,
      years_experience: fav.years_experience,
      hourly_rate: fav.hourly_rate,
      verification_status: fav.verification_status,
      average_rating: parseFloat(fav.average_rating || 0).toFixed(1),
      total_ratings: fav.total_ratings || 0,
      skill_name: fav.skill_names
        ? fav.skill_names.split(", ")[0]
        : "Professional",
      all_skills: fav.skill_names ? fav.skill_names.split(", ") : [],
    }));

    res.json({ favorites: formatted });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Check if a skilled worker is in user's favorites
export const checkFavorite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { skilled_id } = req.params;

    const [result] = await pool.query(
      "SELECT * FROM favorites WHERE user_id = ? AND skilled_id = ?",
      [user_id, skilled_id],
    );

    res.json({
      isFavorite: result.length > 0,
      favorite: result[0] || null,
    });
  } catch (error) {
    console.error("Error checking favorite:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
