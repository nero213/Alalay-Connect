import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

// Config the dotenv so i can use it
dotenv.config();

// This handles the database query
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE || "alalay_connect",
  port: process.env.DB_PORT ?? 3306,
  ssl: {
    ca: fs.readFileSync("./certs/isrgrootx1.pem"),
  },
  connectionLimit: 10,
  charset: "utf8mb4",
  collation: "utf8mb4_unicode_ci",
});
