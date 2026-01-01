import express from "express";
import authRoutes from "./routes/auth.js";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import cors from "cors";
<<<<<<< HEAD
=======
import session from "express-session";
import passport from "passport";
import passportRoute from "./routes/passport.routes.js";

// ⚠️ IMPORTANT: Import passport configuration BEFORE routes
import "./config/passport.js"; // Or wherever you put the passport config
>>>>>>> origin/backend

const app = express();
const PORT = process.env.PORT_NUMBER || 3000;

const corsOption = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
<<<<<<< HEAD
  Credentials: true,
=======
  credentials: true, // ✅ lowercase 'c'
>>>>>>> origin/backend
};
app.use(cors(corsOption));

app.use(express.json());

<<<<<<< HEAD

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per window
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

app.use(express.json());

app.use("/api/auth", limiter, authRoutes);
=======
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
  })
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

// Routes
app.use("/api/auth", limiter, authRoutes);
app.use("/auth", passportRoute);

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
>>>>>>> origin/backend

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`port is happening at http://localhost:${PORT}`);
=======
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔗 Facebook login: http://localhost:${PORT}/auth/facebook`);
>>>>>>> origin/backend
});
