import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const found = user[0];

    if (found.status === "suspended") {
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
      });
    }

    if (found.status === "pending") {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: found.email,
      });
    }

    const isMatch = await bcrypt.compare(password, found.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const jwtPayload = {
      id: found.user_id,
      firstName: found.firstName,
      lastName: found.lastName,
      email: found.email,
      status: found.status,
      role: found.role,
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: found.user_id,
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
        role: found.role,
        status: found.status,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Something went wrong with the server" });
  }
};
