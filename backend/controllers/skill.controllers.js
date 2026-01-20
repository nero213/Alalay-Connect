import { pool } from "../config/db.js";

const getProfileId = async (userId) => {
  const [[profile]] = await pool.query(
    "SELECT skilled_id from skilled_profiles WHERE user_id = ?",
    [userId]
  );
  return profile;
};

export const addSkillsToProfile = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
      return res
        .status(400)
        .json({ message: "skills must be a non-empty array" });
    }
    const profile = await getProfileId(req.user.id);
    if (!profile) {
      return res.status(400).json({ message: "profile not found" });
    }
    const values = skills.map((skillsId) => [profile.skilled_id, skillsId]);
    await pool.query(
      "INSERT IGNORE INTO skilled_profile_skills(skilled_id, skill_id) VALUES ?",
      [values]
    );
    res.status(201).json({ message: "succesfully added skills" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "something went wrong with the server" });
  }
};

export const getMyskills = async (req, res) => {
  try {
    const profile = await getProfileId(req.user.id);
    if (!profile) {
      return res.status(400).json({ message: "profile not found" });
    }
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name 
      FROM skills s 
      JOIN skilled_profile_skills sps 
      ON s.skill_id = sps.skill_id
      WHERE sps.skilled_id = ?`,
      [profile.skilled_id]
    );
    res.status(201).json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "spmething went wrong with the server" });
  }
};

export const removeSkillFromProfile = async (req, res) => {
  try {
    const profile = await getProfileId(req.user.id);
    const { skillId } = req.params;
    if (!profile) {
      res.status(404).json({ message: "user not found" });
    }

    await pool.query(
      "DELETE FROM skilled_profile_skills WHERE skilled_id = ? AND skill_id = ?",
      [profile.skilled_id, skillId]
    );
    res.status(201).json({
      message: "remove skilled successful",
      id: profile.skilled_id,
      skill_id: skillId,
    });
  } catch (error) {
    console.error(error);
    res.status(501).json({ message: "something went wrong with the server " });
  }
};
