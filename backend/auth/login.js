import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // console.log("Login attempt for email:", email);

    const [user] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (user.length === 0) {
      console.log("User not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const found = user[0];
    // console.log(
    //   "User found:",
    //   found.email,
    //   "Role:",
    //   found.role,
    //   "Status:",
    //   found.status,
    // );

    // Check if user is suspended
    if (found.status === "suspended") {
      console.log("Account suspended:", email);
      return res.status(403).json({
        message: "Your account has been suspended. Please contact support.",
      });
    }

    // Check if user is pending verification
    if (found.status === "pending") {
      console.log("Email not verified:", email);
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        email: found.email,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, found.password);
    // console.log("Password match:", isMatch);

    if (!isMatch) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT payload
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

    // console.log("Login successful for:", email);

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
    console.error("Login error details:", err);
    console.error("Error stack:", err.stack);

    // Send proper error response
    return res.status(500).json({
      message: "Something went wrong with the server",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
