import mysql from "mysql2/promise";
import dotenv from "dotenv";

// this is to config the dotenv so i can use it
dotenv.config();

// this handles the database query
export const pool = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "alalay_connect",
  connectionLimit: 10,
  charset: "utf8mb4",
  collation: "utf8mb4_unicode_ci",
});
