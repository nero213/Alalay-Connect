import express from "express";
import authRoutes from "./routes/auth.js";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import cors from "cors";

const app = express();
const PORT = process.env.PORT_NUMBER || 3000;

const corsOption = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  Credentials: true,
};
app.use(cors(corsOption));

app.use(express.json());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per window
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

app.use(express.json());

app.use("/api/auth", limiter, authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`port is happening at http://localhost:${PORT}`);
});
