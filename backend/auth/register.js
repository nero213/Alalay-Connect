import { validationResult } from "express-validator";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { generateVerificationCode, sendVerificationEmail } from "../utils/email.js"; // IMPORT THESE!

// this is used for the registration
export const userRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // this is to try and help specify the message
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ message: errorMessages });
  }
  
  try {
    const { email, firstName, lastName, password, phone, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: "Email, password, first name, and last name are required",
      });
    }

    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1", // Changed USERS to users (lowercase)
      [email, phone],
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Phone number or email is already taken" });
    }

    // this is done to hashed the password for more security
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUuid = uuidv4();
    
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // this is now to try and insert values into the database
    const [result] = await pool.query(
      `INSERT INTO users (
        uuid, email, password, firstName, lastName, phone, role, 
        status, verification_token, verification_token_expires
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUuid,
        email,
        hashedPassword,
        firstName,
        lastName,
        phone || null,
        role || "resident",
        "pending", // status starts as pending
        verificationCode,
        expiresAt,
      ],
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    // ONLY ONE RESPONSE - removed the duplicate
    res.status(201).json({
      message: "Registration successful! Please check your email for verification code.",
      userId: result.insertId,
      email: email,
      requiresVerification: true,
    });
    
  } catch (err) {
    console.error("Registration error:", err); // Add this for debugging
    res.status(500).json({ message: "Something went wrong" });
  }
};