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
    CONCAT(u.firstName, ' ', u.lastName) AS fullName, 
    sp.bio, 
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
    // Get the skilled profile
    const [profileRows] = await pool.query(
      `SELECT sp.*, 
              u.email, 
              u.phone, 
              u.role,
              u.status as account_status,
              u.created_at as member_since
       FROM skilled_profiles sp
       JOIN users u ON u.user_id = sp.user_id
       WHERE sp.user_id = ?`,
      [req.user.id],
    );

    if (!profileRows.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = profileRows[0];

    // Get the user's skills
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name, sps.created_at AS added_at
       FROM skills s
       JOIN skilled_profile_skills sps ON s.skill_id = sps.skill_id
       WHERE sps.skilled_id = ?`,
      [profile.skilled_id],
    );

    // Get profile completion status
    const completionStatus = {
      basic_info: !!(profile.bio && profile.years_experience),
      location: !!(profile.latitude && profile.longitude),
      skills: skills.length > 0,
      gov_id: !!profile.gov_id,
      certificate: !!profile.certificate,
      profile_image: !!profile.profile_image,
    };

    // Calculate overall completion percentage
    const totalFields = Object.keys(completionStatus).length;
    const completedFields =
      Object.values(completionStatus).filter(Boolean).length;
    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100,
    );

    // Return complete profile
    res.json({
      profile: {
        ...profile,
        skills,
        completion: {
          status: completionStatus,
          percentage: completionPercentage,
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
