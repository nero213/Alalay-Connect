import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken"

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await pool.query(
      "SELECT * FROM users WHERE  email = ? limit 1",
      [email]
    );
    if (user.length === 0) {
      res.status(400).json({ message: "user not found" });
    }
    const found = user[0];
    const isMatch = await bcrypt.compare(password, found.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (found.status !== "active") {
      return res.status(403).json({
        message: `status is currently ${found.status}.`,
      });
    }

    const token = 
  } catch (err) {
    res.status(500).json({ message: "failed" });
  }
};
