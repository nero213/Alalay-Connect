import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await pool.query(
      "SELECT * FROM users WHERE  email = ? limit 1",
      [email]
    );
    if (user.length === 0) {
      return res.status(400).json({ message: "user not found" });
    }
    const found = user[0];
    const isMatch = await bcrypt.compare(password, found.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // if (found.status !== "active") {
    //   return res.status(403).json({
    //     message: `status is currently ${found.status}.`,
    //   });
    // }

    const jwtPayload = {
      firstName: found.firstName,
      lastName: found.lastName,
      email: found.email,
      role: found.role,
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });

    return res.status(200).json({
      message: "successful",
      token,
      user: {
        username: found.firstName,
        lastName: found.lastName,
        email: found.email,
        role: found.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "something wrong with the server", error: err.message });
  }
};
