// backend/config/passport.js
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
        process.env.FACEBOOK_CALLBACK_URL ||
        "https://unliteralized-hadley-metaleptically.ngrok-free.dev/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "picture.type(large)"],
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const provider = "facebook";
        const provider_user_id = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const firstName = profile.name?.givenName || null;
        const lastName = profile.name?.familyName || null;
        const profilePicture = profile.photos?.[0]?.value || null;

        // Check if auth provider exists
        const [authRows] = await pool.query(
          "SELECT * FROM auth_providers WHERE provider = ? AND provider_user_id = ?",
          [provider, provider_user_id],
        );

        let user = null;

        if (authRows.length > 0) {
          // User exists, get complete user data with profile image
          const user_id = authRows[0].user_id;
          const [userRows] = await pool.query(
            `SELECT u.*, 
                    sp.skilled_id, 
                    sp.verification_status as skilled_verification,
                    sp.profile_image as skilled_profile_image
             FROM users u
             LEFT JOIN skilled_profiles sp ON sp.user_id = u.user_id
             WHERE u.user_id = ?`,
            [user_id],
          );

          user = userRows[0];

          // Determine which profile image to use
          if (user.role === "skilled" && user.skilled_profile_image) {
            user.profile_image = user.skilled_profile_image;
          }
        } else {
          // Create new user with Facebook data
          const [result] = await pool.query(
            `INSERT INTO users(email, firstName, lastName, password, role, status, profile_image, email_verified_at) 
             VALUES(?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              email,
              firstName,
              lastName,
              "",
              "resident",
              "active",
              profilePicture,
            ],
          );

          const user_id = result.insertId;

          // Create auth provider record
          await pool.query(
            "INSERT INTO auth_providers (user_id, provider, provider_user_id) VALUES (?, ?, ?)",
            [user_id, provider, provider_user_id],
          );

          // Create default user settings
          await pool.query("INSERT INTO user_settings (user_id) VALUES (?)", [
            user_id,
          ]);

          // Get the newly created user
          const [userRows] = await pool.query(
            `SELECT u.*, 
                    sp.skilled_id
             FROM users u
             LEFT JOIN skilled_profiles sp ON sp.user_id = u.user_id
             WHERE u.user_id = ?`,
            [user_id],
          );
          user = userRows[0];
        }

        return done(null, user);
      } catch (err) {
        console.error("Facebook auth error:", err);
        return done(err, null);
      }
    },
  ),
);

// Serialize/Deserialize
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, 
              sp.skilled_id
       FROM users u
       LEFT JOIN skilled_profiles sp ON sp.user_id = u.user_id
       WHERE u.user_id = ?`,
      [id],
    );
    done(null, rows[0]);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
