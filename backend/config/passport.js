import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { pool } from "./db.js";
import "dotenv/config";

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL:
        "https://unliteralized-hadley-metaleptically.ngrok-free.dev/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const provider = "facebook";
        const provider_user_id = profile.id;

        const [authRows] = await pool.query(
          "SELECT * FROM auth_providers WHERE provider = ? AND provider_user_id = ?",
          [provider, provider_user_id]
        );

        if (authRows.length > 0) {
          const user_id = authRows[0].user_id;
          const [userRows] = await pool.query(
            "SELECT * FROM users WHERE user_id = ?",
            [user_id]
          );
          return done(null, userRows[0]);
        } else {
          const email = profile.emails?.[0].value || null;
          const firstName = profile.name?.givenName || null;
          const lastName = profile.name?.familyName || null;

          const [result] = await pool.query(
            "INSERT INTO users(email, firstName, lastName, password, role, status) VALUES(?,?,?,?,?,?)",
            [email, firstName, lastName, "", "resident", "active"]
          );

          const user_id = result.insertId;

          await pool.query(
            "INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES (?, ?, ?)",
            [user_id, provider, provider_user_id]
          );

          const newUser = {
            user_id,
            email,
            firstName,
            lastName,
            role: "resident",
            status: "active",
          };
          return done(null, newUser);
        }
      } catch (err) {
        console.error("Facebook auth error:", err);
        return done(err, null);
      }
    }
  )
);

// Serialize/Deserialize
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      id,
    ]);
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
