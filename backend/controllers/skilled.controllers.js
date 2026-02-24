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
      [req.user.id],
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
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET gov_id = ? WHERE user_id = ?",
      [req.file.path, req.user.id],
    );

    res.json({ message: "Goverment ID uploaded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong with the Server" });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET certificate = ? WHERE user_id = ?",
      [req.file.path, req.user.id],
    );

    res.json({ message: "Certificate Uploaded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong with the server" });
  }
};

export const uploadProfileImages = async (req, res) => {
  try {
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);
    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET profile_image = ? WHERE user_id = ?",
      [req.file.path, req.user.id],
    );

    res.json({ message: "profile images Uploaded" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something When Wrong with the server" });
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
    WHERE (? IS NULL OR s.name = ?)
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
