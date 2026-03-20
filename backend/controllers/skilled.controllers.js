import { pool } from "../config/db.js";
import axios from "axios";

const ensureProfileExists = async (userId) => {
  const [[profile]] = await pool.query(
    "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
    [userId],
  );
  return profile;
};

export const getSkilledUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM skilled_profiles");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Something wrong with the server " });
  }
};

// this is for the creation of skilled profile
export const createSkilledProfile = async (req, res) => {
  try {
    const { bio, years_experience } = req.body;

    const [existing] = await pool.query(
      "SELECT * FROM skilled_profiles WHERE user_id = ?",
      [req.user.id],
    );
    if (existing.length) {
      return res.status(400).json({ message: "skilled profile already exist" });
    }

    const [[user]] = await pool.query(
      "SELECT firstName,lastName FROM users WHERE user_id = ? ",
      [req.user.id],
    );
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    await pool.query(
      `INSERT INTO skilled_profiles (user_id, firstName, lastName, bio,  years_experience) VALUES (?, ?, ?,?,?)`,
      [req.user.id, user.firstName, user.lastName, bio, years_experience],
    );
    res.status(201).json({ message: "skilled profile created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const getMySkilledProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM skilled_profiles WHERE user_id = ?",
      [req.usser.id],
    );
    if (!rows.length) {
      return res.status(404).json({ message: "skilled profile not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong With the Server" });
  }
};

export const uploadGovID = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`; // Forward slashes

    await pool.query(
      "UPDATE skilled_profiles SET gov_id = ? WHERE user_id = ?",
      [fileUrl, req.user.id],
    );

    res.json({
      message: "Government ID uploaded successfully",
      filePath: fileUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`; // Forward slashes

    await pool.query(
      "UPDATE skilled_profiles SET certificate = ? WHERE user_id = ?",
      [fileUrl, req.user.id],
    );

    res.json({
      message: "Certificate uploaded successfully",
      filePath: fileUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const uploadProfileImages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    // ✅ IMPORTANT: Use forward slashes for the URL path
    const fileUrl = `/uploads/${req.file.filename}`;

    await pool.query(
      "UPDATE skilled_profiles SET profile_image = ? WHERE user_id = ?",
      [fileUrl, req.user.id], // Store with forward slashes
    );

    res.json({
      message: "Profile image uploaded successfully",
      filePath: fileUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const verifySkilledProfile = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await pool.query(
      `UPDATE skilled_profiles SET verification_status = ?, verified_at = NOW() WHERE skilled_id = ?`,
      [status, id],
    );
    if (status === "approved") {
      await pool.query(
        `UPDATE users u 
      JOIN skilled_profiles sp ON sp.user_id = u.user_id
      SET u.role = "skilled", u.status = "active" 
      WHERE sp.skilled_id = ?`,
        [id],
      );
    }

    res.json({ message: `skilled proifle ${status}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong with the server" });
  }
};

const getAddressFromCoordinates = async (lat, lon) => {
  try {
    const { data } = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { lat, lon, format: "json", addressdetails: 1 },
        headers: {
          "User-Agent": "YourAppName/1.0", // Good practice for Nominatim
        },
      },
    );

    const barangay = data.address.suburb || data.address.village || "Unknown";
    const city = data.address.city || data.address.town || "Unknown";

    return { barangay, city };
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return { barangay: "Unknown", city: "Unknown" };
  }
};

export const updateSkilledLocation = async (req, res) => {
  try {
    let { barangay, city, latitude, longitude } = req.body;

    // If barangay or city is missing/empty, get from coordinates
    if (!barangay || !barangay.trim() || !city || !city.trim()) {
      if (latitude && longitude) {
        const result = await getAddressFromCoordinates(latitude, longitude);
        barangay = result.barangay;
        city = result.city;
      }
    }

    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res
        .status(404)
        .json({ message: "skilled profile user not found" });
    }

    await pool.query(
      `UPDATE skilled_profiles SET barangay = ?, city = ?, latitude = ?, longitude = ?, is_active = 1 WHERE user_id = ?`,
      [barangay, city, latitude ?? null, longitude ?? null, req.user.id],
    );

    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.error("Location update error:", error);
    res.status(500).json({ message: "Something wrong with the server" });
  }
};
export const searchSkilledWorkers = async (req, res) => {
  try {
    const { lat, lng, skill } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "location required" });
    }
    const query = `SELECT u.user_id, 
    CONCAT(sp.firstName, ' ', sp.lastName) AS fullName, 
    sp.bio, 
    sp.skilled_id,
    sp.profile_image,
    sp.years_experience,
    sp.latitude,
    sp.longitude,
    s.name,
    u.phone,
    ( 
      6371 * acos(
      cos(radians(?)) * 
      cos(radians(sp.latitude)) *
      cos(radians(sp.longitude) - radians(?)) + 
      sin(radians(?)) * sin(radians(sp.latitude))
      )
    ) AS distance 
    FROM skilled_profiles sp 
    JOIN users u ON u.user_id = sp.user_id
    JOIN skilled_profile_skills sps ON sp.skilled_id = sps.skilled_id
    JOIN skills s ON s.skill_id = sps.skill_id
    WHERE (? IS NULL OR s.name = ?) AND sp.verification_status = "approved"
    ORDER BY distance ASC`;

    const [rows] = await pool.execute(query, [
      lat,
      lng,
      lat,
      skill || null,
      skill || null,
    ]);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// In your skilledProfiles controller
export const getCompleteSkilledProfile = async (req, res) => {
  try {
    // Get basic profile with hourly_rate
    const [profileRows] = await pool.query(
      `SELECT sp.*, u.email, u.phone, u.role, u.status
       FROM skilled_profiles sp
       JOIN users u ON u.user_id = sp.user_id
       WHERE sp.user_id = ?`,
      [req.user.id],
    );

    if (!profileRows.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = profileRows[0];

    // Get user's skills
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name 
       FROM skills s
       JOIN skilled_profile_skills sps ON s.skill_id = sps.skill_id
       WHERE sps.skilled_id = ?`,
      [profile.skilled_id],
    );

    // Calculate profile completion (include hourly_rate)
    const completion = {
      basic_info: !!(profile.bio && profile.years_experience),
      location: !!(profile.latitude && profile.longitude),
      skills: skills.length > 0,
      gov_id: !!profile.gov_id,
      certificate: !!profile.certificate,
      profile_image: !!profile.profile_image,
      pricing: !!profile.hourly_rate, // Add this
    };

    const totalFields = Object.keys(completion).length;
    const completedFields = Object.values(completion).filter(Boolean).length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    res.json({
      profile: {
        ...profile,
        skills,
        completion: {
          ...completion,
          percentage,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching complete profile:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const updateBio = async (req, res) => {
  try {
    const { bio, years_experience } = req.body;

    // Validate input
    if (!bio || !years_experience) {
      return res
        .status(400)
        .json({ message: "Bio and years of experience are required" });
    }

    // Check if profile exists
    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    // Update the profile
    await pool.query(
      `UPDATE skilled_profiles 
       SET bio = ?, years_experience = ? 
       WHERE user_id = ?`,
      [bio, years_experience, req.user.id],
    );

    res.status(200).json({
      message: "Profile updated successfully",
      bio,
      years_experience,
    });
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET profile_image = ? WHERE user_id = ?",
      [req.file.path, req.user.id],
    );

    res.json({
      message: "Profile image updated successfully",
      imagePath: req.file.path,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    await pool.query("UPDATE users SET phone = ? WHERE user_id = ?", [
      phone,
      req.user.id,
    ]);

    res
      .status(200)
      .json({ message: "Contact information updated successfully" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

// Get public profile for clients to view
// Get public profile for clients to view
export const getPublicSkilledProfile = async (req, res) => {
  try {
    const { id } = req.params; // skilled_id

    console.log("Fetching public profile for skilled_id:", id);

    // Get skilled profile with user details - ADD hourly_rate to the SELECT
    const [profileRows] = await pool.query(
      `SELECT 
        sp.skilled_id,
        sp.user_id,
        sp.firstName,
        sp.lastName,
        sp.bio,
        sp.years_experience,
        sp.hourly_rate,  
        sp.profile_image,
        sp.gov_id,
        sp.certificate,
        sp.verification_status,
        sp.barangay,
        sp.city,
        sp.latitude,
        sp.longitude,
        sp.created_at as member_since,
        u.email,
        u.phone
      FROM skilled_profiles sp
      JOIN users u ON u.user_id = sp.user_id
      WHERE sp.skilled_id = ? AND sp.verification_status = 'approved'`,
      [id],
    );

    if (!profileRows.length) {
      console.log("No approved profile found for skilled_id:", id);
      return res
        .status(404)
        .json({ message: "Professional not found or not approved" });
    }

    const profile = profileRows[0];

    // Get the worker's skills
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name 
       FROM skills s
       JOIN skilled_profile_skills sps ON s.skill_id = sps.skill_id
       WHERE sps.skilled_id = ?`,
      [id],
    );

    // Get rating statistics
    const [ratingStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM ratings
       WHERE skilled_id = ?`,
      [id],
    );

    // Format rating stats
    const total = ratingStats[0].total_ratings || 0;
    const stats =
      total > 0
        ? {
            total_ratings: total,
            average_rating: parseFloat(
              ratingStats[0].average_rating || 0,
            ).toFixed(1),
            distribution: {
              5: {
                count: ratingStats[0].five_star || 0,
                percentage: Math.round(
                  (ratingStats[0].five_star / total) * 100,
                ),
              },
              4: {
                count: ratingStats[0].four_star || 0,
                percentage: Math.round(
                  (ratingStats[0].four_star / total) * 100,
                ),
              },
              3: {
                count: ratingStats[0].three_star || 0,
                percentage: Math.round(
                  (ratingStats[0].three_star / total) * 100,
                ),
              },
              2: {
                count: ratingStats[0].two_star || 0,
                percentage: Math.round((ratingStats[0].two_star / total) * 100),
              },
              1: {
                count: ratingStats[0].one_star || 0,
                percentage: Math.round((ratingStats[0].one_star / total) * 100),
              },
            },
          }
        : {
            total_ratings: 0,
            average_rating: "0.0",
            distribution: {
              5: { count: 0, percentage: 0 },
              4: { count: 0, percentage: 0 },
              3: { count: 0, percentage: 0 },
              2: { count: 0, percentage: 0 },
              1: { count: 0, percentage: 0 },
            },
          };

    // Get recent reviews
    const [recentReviews] = await pool.query(
      `SELECT 
        r.*,
        u.firstName,
        u.lastName,
        u.profile_image as client_image,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') as created_at
       FROM ratings r
       JOIN users u ON u.user_id = r.client_id
       WHERE r.skilled_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id],
    );

    // Calculate distance if lat/lng provided
    let distance = null;
    if (
      req.query.lat &&
      req.query.lng &&
      profile.latitude &&
      profile.longitude
    ) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);

      // Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = ((profile.latitude - lat) * Math.PI) / 180;
      const dLon = ((profile.longitude - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((profile.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = R * c;
    }

    res.json({
      profile: {
        ...profile,
        skills,
        fullName: `${profile.firstName} ${profile.lastName}`,
        distance: distance ? parseFloat(distance).toFixed(1) : null,
        average_rating: stats.average_rating,
        total_ratings: stats.total_ratings,
        hourly_rate: profile.hourly_rate || 500, // Ensure hourly_rate is included with default
      },
      ratings: {
        stats,
        recent: recentReviews,
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};

// Update pricing
export const updatePricing = async (req, res) => {
  try {
    const { hourly_rate } = req.body;

    if (!hourly_rate || hourly_rate < 0) {
      return res.status(400).json({ message: "Valid hourly rate is required" });
    }

    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET hourly_rate = ? WHERE user_id = ?",
      [hourly_rate, req.user.id],
    );

    res.status(200).json({
      message: "Pricing updated successfully",
      hourly_rate,
    });
  } catch (error) {
    console.error("Error updating pricing:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get pricing
export const getPricing = async (req, res) => {
  try {
    const profile = await ensureProfileExists(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    const [result] = await pool.query(
      "SELECT hourly_rate FROM skilled_profiles WHERE user_id = ?",
      [req.user.id],
    );

    res.json({ hourly_rate: result[0].hourly_rate || 500 });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
