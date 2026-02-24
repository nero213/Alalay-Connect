import { pool } from "../config/db.js";

const ensureProfileExists = async (userId) => {
  const [[profile]] = await pool.query(
    "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
    [userId]
  );
  return profile;
};
// this is for the creation of skilled profile
export const createSkilledProfile = async (req, res) => {
  try {
    
    const { bio, years_experience } = req.body;

    const [existing] = await pool.query(
      "SELECT * FROM skilled_profiles WHERE user_id = ?",
      [req.user.id]
    );
    if (existing.length) {
      return res.status(400).json({ message: "skilled profile already exist" });
    }
    await pool.query(
      `INSERT INTO skilled_profiles (user_id, bio, years_experience) VALUES (?, ?, ?)`,
      [req.user.id, bio, years_experience]
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
      [req.user.id]
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
    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET gov_id = ? WHERE user_id = ?",
      [req.file.path, req.user.id]
    );

    res.json({ message: "Goverment ID uploaded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong with the Server" });
  }
};

export const uploadCertificate = async (req, res) => {
  try {
    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET certificate = ? WHERE user_id = ?",
      [req.file.path, req.user.id]
    );

    res.json({ message: "Certificate Uploaded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something Went Wrong with the server" });
  }
};

export const uploadProfileImages = async (req, res) => {
  try {
    const profile = await ensureProfileExists(req.user.id);

    if (!profile) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    await pool.query(
      "UPDATE skilled_profiles SET profile_image = ? WHERE user_id = ?",
      [req.file.path, req.user.id]
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
      [status, id]
    );
    if (status === "approved") {
      await pool.query(
        `UPDATE users u 
      JOIN skilled_profiles sp ON sp.user_id = u.user_id
      SET u.role = "skilled", u.status = "active" 
      WHERE sp.skilled_id = ?`,
        [id]
      );
    }

    res.json({ message: `skilled proifle ${status}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong with the server" });
  }
};
