import { pool } from "../config/db.js";

// ============ DASHBOARD STATS ============
export const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'resident' THEN 1 ELSE 0 END) as total_residents,
        SUM(CASE WHEN role = 'skilled' THEN 1 ELSE 0 END) as total_skilled,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_verification,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
      FROM users
    `);

    // Get booking statistics
    const [bookingStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(total_amount) as total_revenue
      FROM bookings
      WHERE status = 'completed'
    `);

    // Get skilled profile statistics
    const [skilledStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_skilled_profiles,
        SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending_verification,
        SUM(CASE WHEN verification_status = 'approved' THEN 1 ELSE 0 END) as approved_profiles,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected_profiles
      FROM skilled_profiles
    `);

    // Get recent activity (last 7 days bookings)
    const [recentActivity] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM bookings
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      users: userStats[0],
      bookings: bookingStats[0],
      skilledProfiles: skilledStats[0],
      recentActivity,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ============ USER MANAGEMENT ============
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      status = "",
    } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        user_id, uuid, email, firstName, lastName, phone, role, status,
        created_at,
        (SELECT COUNT(*) FROM bookings WHERE client_id = users.user_id) as total_bookings
      FROM users
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (email LIKE ? OR firstName LIKE ? OR lastName LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const countParams = [];

    if (search) {
      countQuery += ` AND (email LIKE ? OR firstName LIKE ? OR lastName LIKE ? OR phone LIKE ?)`;
      countParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      );
    }
    if (role) {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    const [total] = await pool.query(countQuery, countParams);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.query("UPDATE users SET status = ? WHERE user_id = ?", [
      status,
      user_id,
    ]);

    // Create notification for the user
    const [user] = await pool.query(
      "SELECT email, firstName FROM users WHERE user_id = ?",
      [user_id],
    );

    if (user.length) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES (?, 'system', 'Account Status Updated', 
                 'Your account has been ${status === "active" ? "activated" : "suspended"}.',
                 ?)`,
        [user_id, JSON.stringify({ status, action: "status_update" })],
      );
    }

    res.json({ message: `User ${status} successfully` });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ============ SKILLED PROFILE VERIFICATION ============
export const getPendingSkilledProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [profiles] = await pool.query(
      `
      SELECT 
        sp.*,
        u.email,
        u.phone,
        (SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
         FROM skilled_profile_skills sps
         JOIN skills s ON s.skill_id = sps.skill_id
         WHERE sps.skilled_id = sp.skilled_id) as skills
      FROM skilled_profiles sp
      JOIN users u ON u.user_id = sp.user_id
      WHERE sp.verification_status = 'pending'
      ORDER BY sp.created_at ASC
      LIMIT ? OFFSET ?
    `,
      [parseInt(limit), offset],
    );

    const [total] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM skilled_profiles 
      WHERE verification_status = 'pending'
    `);

    res.json({
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pending profiles:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSkilledProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const [profile] = await pool.query(
      `
      SELECT 
        sp.*,
        u.email,
        u.phone,
        u.created_at as user_joined,
        (SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
         FROM skilled_profile_skills sps
         JOIN skills s ON s.skill_id = sps.skill_id
         WHERE sps.skilled_id = sp.skilled_id) as skills
      FROM skilled_profiles sp
      JOIN users u ON u.user_id = sp.user_id
      WHERE sp.skilled_id = ?
    `,
      [id],
    );

    if (!profile.length) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile: profile[0] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const verifySkilledProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update skilled profile
    await pool.query(
      `UPDATE skilled_profiles 
       SET verification_status = ?, verified_at = NOW() 
       WHERE skilled_id = ?`,
      [status, id],
    );

    // Get user_id from skilled profile
    const [profile] = await pool.query(
      "SELECT user_id FROM skilled_profiles WHERE skilled_id = ?",
      [id],
    );

    if (profile.length && status === "approved") {
      // Update user role to skilled
      await pool.query("UPDATE users SET role = 'skilled' WHERE user_id = ?", [
        profile[0].user_id,
      ]);
    }

    // Create notification for the user
    const [user] = await pool.query(
      "SELECT email, firstName FROM users WHERE user_id = ?",
      [profile[0].user_id],
    );

    if (user.length) {
      const message =
        status === "approved"
          ? "Congratulations! Your skilled worker profile has been approved. You can now start accepting bookings."
          : `Your skilled worker application was not approved. ${admin_notes || "Please check your documents and try again."}`;

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES (?, 'system', 'Profile Verification Update', ?, ?)`,
        [profile[0].user_id, message, JSON.stringify({ status, admin_notes })],
      );
    }

    // Log admin action
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, new_data)
       VALUES (?, 'verify_skilled_profile', 'skilled_profiles', ?, ?)`,
      [req.user.id, id, JSON.stringify({ status, admin_notes })],
    );

    res.json({ message: `Profile ${status} successfully` });
  } catch (error) {
    console.error("Error verifying profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ============ SKILL MANAGEMENT ============
export const getAllSkills = async (req, res) => {
  try {
    const [skills] = await pool.query("SELECT * FROM skills ORDER BY name ASC");
    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createSkill = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    // Check if skill already exists
    const [existing] = await pool.query("SELECT * FROM skills WHERE name = ?", [
      name,
    ]);

    if (existing.length) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    const [result] = await pool.query("INSERT INTO skills (name) VALUES (?)", [
      name,
    ]);

    // Log admin action
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, new_data)
       VALUES (?, 'create_skill', 'skills', ?, ?)`,
      [req.user.id, result.insertId, JSON.stringify({ name })],
    );

    res.status(201).json({
      message: "Skill created successfully",
      skill: { skill_id: result.insertId, name },
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    // Get old data for audit
    const [old] = await pool.query("SELECT * FROM skills WHERE skill_id = ?", [
      id,
    ]);

    if (!old.length) {
      return res.status(404).json({ message: "Skill not found" });
    }

    await pool.query("UPDATE skills SET name = ? WHERE skill_id = ?", [
      name,
      id,
    ]);

    // Log admin action
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, old_data, new_data)
       VALUES (?, 'update_skill', 'skills', ?, ?, ?)`,
      [
        req.user.id,
        id,
        JSON.stringify({ name: old[0].name }),
        JSON.stringify({ name }),
      ],
    );

    res.json({ message: "Skill updated successfully" });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if skill is being used
    const [used] = await pool.query(
      "SELECT * FROM skilled_profile_skills WHERE skill_id = ?",
      [id],
    );

    if (used.length) {
      return res.status(400).json({
        message: "Cannot delete skill that is being used by skilled workers",
      });
    }

    await pool.query("DELETE FROM skills WHERE skill_id = ?", [id]);

    // Log admin action
    await pool.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id)
       VALUES (?, 'delete_skill', 'skills', ?)`,
      [req.user.id, id],
    );

    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ============ REPORTED CONTENT ============
export const getReportedRatings = async (req, res) => {
  try {
    const [reports] = await pool.query(`
      SELECT 
        r.*,
        u.firstName as reporter_firstName,
        u.lastName as reporter_lastName,
        ru.firstName as reported_user_firstName,
        ru.lastName as reported_user_lastName,
        sp.firstName as skilled_firstName,
        sp.lastName as skilled_lastName
      FROM reports
      LEFT JOIN users u ON u.user_id = reports.reporter_id
      LEFT JOIN users ru ON ru.user_id = reports.reported_user_id
      LEFT JOIN ratings rat ON rat.rating_id = reports.reported_rating_id
      LEFT JOIN skilled_profiles sp ON sp.skilled_id = rat.skilled_id
      WHERE reports.status = 'pending'
      ORDER BY reports.created_at DESC
    `);

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reported content:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_notes } = req.body;

    await pool.query(
      `UPDATE reports 
       SET status = 'resolved', resolved_at = NOW(), resolved_by = ?, admin_notes = ?
       WHERE report_id = ?`,
      [req.user.id, admin_notes, id],
    );

    if (action === "hide_rating") {
      const [report] = await pool.query(
        "SELECT reported_rating_id FROM reports WHERE report_id = ?",
        [id],
      );

      if (report.length && report[0].reported_rating_id) {
        await pool.query(
          "UPDATE ratings SET status = 'hidden' WHERE rating_id = ?",
          [report[0].reported_rating_id],
        );
      }
    }

    res.json({ message: "Report resolved successfully" });
  } catch (error) {
    console.error("Error resolving report:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get current admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const [admin] = await pool.query(
      `SELECT user_id, firstName, lastName, email, role, status 
       FROM users 
       WHERE user_id = ? AND role = 'admin'`,
      [adminId],
    );

    if (!admin.length) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ admin: admin[0] });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
