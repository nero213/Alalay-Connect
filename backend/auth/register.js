import { validationResult } from "express-validator";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
    // this is used to try and see if the phone number is taken

    const [existing] = await pool.query(
      "SELECT * FROM USERS WHERE email = ? OR phone = ? LIMIT 1",
      [email, phone]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "phone number or email is already taken" });
    }

    // this is done to hashed the password for more security
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUuid = uuidv4();

    // this is now to try and insert values into the database
    await pool.query(
      `INSERT INTO users (uuid, email, firstName, lastName, password, phone, role, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUuid,
        email,
        firstName,
        lastName,
        hashedPassword,
        phone || null,
        role || "resident",
        "active",
      ]
    );
    //  this is only used for testing
    // const [users] = await pool.query("SELECT * FROM USERS WHERE email = ? ", [
    //   email,
    // ]);
    res.status(201).json({ message: "succesful registration" });
  } catch (err) {
    res.status(500).json({ Message: "something went wrong" });
  }
};
