import express from "express";
import authRoutes from "./routes/auth.routes.js";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import passportRoute from "./routes/passport.routes.js";
import skilledProfileRoutes from "./routes/skilled.routes.js";
import skillProfileRoutes from "./routes/skill.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import userSettingsRoutes from "./routes/userSetting.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import favoritesRoutes from "./routes/favorites.routes.js";
import ratingRoutes from "./routes/rating.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import messageRoutes from "./routes/message.routes.js";
import reportRoutes from "./routes/report.routes.js";
import residentRoutes from "./routes/resident.routes.js";
import helpRoutes from "./routes/help.routes.js";
// ⚠️ IMPORTANT: Import passport configuration BEFORE routes
import "./config/passport.js"; // Or wherever you put the passport config

const app = express();
const PORT = process.env.PORT_NUMBER || 3000;
const backEndPort = process.env.BACKEND_PORT;
const frontEndPort = process.env.FRONTEND_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://alalay-connect.vercel.app", // Main Production
  "https://alalay-connect-git-main-robekyle3-1218s-projects.vercel.app", // Branch-specific
  "https://alalay-connect-qjyr7qorp-robekyle3-1218s-projects.vercel.app", // Preview/Current
];

const corsOption = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); // Helps you debug new domains
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOption));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

// Initialize passport AFTER session
app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later.",
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/help", helpRoutes);
app.use("/api/users/resident", residentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/user", userSettingsRoutes);
app.use("/api/auth", limiter, authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/auth", passportRoute);
app.use("/api/skilled_profiles", skilledProfileRoutes);
app.use("/api/skill", skillProfileRoutes);

// Test Facebook config
// app.get("/test-facebook-config", (req, res) => {
//   const strategies = Object.keys(passport._strategies);
//   res.json({
//     facebookConfigured: strategies.includes('facebook'),
//     allStrategies: strategies,
//     hasFBClientID: !!process.env.FB_CLIENT_ID,
//     hasFBClientSecret: !!process.env.FB_CLIENT_SECRET
//   });
// });

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`${backEndPort}`);
  console.log(`${frontEndPort}`);
  console.log(`🔗 Facebook login: http://localhost:${PORT}/auth/facebook`);
  console.log(`📁 Uploads folder: ${path.join(__dirname, "uploads")}`);
});
