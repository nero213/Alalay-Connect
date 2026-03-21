import { pool } from "../config/db.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const {
      reported_user_id,
      reported_skill_id,
      reported_rating_id,
      reported_message_id,
      type,
      reason,
      description,
    } = req.body;

    // Validate required fields
    if (!type || !reason) {
      return res.status(400).json({ message: "Type and reason are required" });
    }

    // Check if user is reporting themselves
    if (reported_user_id === reporter_id) {
      return res.status(400).json({ message: "You cannot report yourself" });
    }

    // Insert report
    const [result] = await pool.query(
      `INSERT INTO reports (reporter_id, reported_user_id, reported_skill_id, reported_rating_id, reported_message_id, type, reason, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reporter_id,
        reported_user_id || null,
        reported_skill_id || null,
        reported_rating_id || null,
        reported_message_id || null,
        type,
        reason,
        description || null,
      ],
    );

    // Create notification for admin
    const [adminUsers] = await pool.query(
      "SELECT user_id FROM users WHERE role = 'admin'",
    );

    for (const admin of adminUsers) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES (?, 'system', 'New Report', 
                 'A new ${type} report has been submitted and requires review',
                 ?)`,
        [
          admin.user_id,
          JSON.stringify({ report_id: result.insertId, type, reporter_id }),
        ],
      );
    }

    res.status(201).json({
      message: "Report submitted successfully",
      report_id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all reports (admin only)
export const getAllReports = async (req, res) => {
  try {
    const { status = "pending", type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.*,
        u1.firstName as reporter_firstName, u1.lastName as reporter_lastName,
        u2.firstName as reported_firstName, u2.lastName as reported_lastName,
        rat.rating,
        rat.review as rating_review,
        m.message as reported_message,
        sp.firstName as skilled_firstName, sp.lastName as skilled_lastName
      FROM reports r
      LEFT JOIN users u1 ON u1.user_id = r.reporter_id
      LEFT JOIN users u2 ON u2.user_id = r.reported_user_id
      LEFT JOIN ratings rat ON rat.rating_id = r.reported_rating_id
      LEFT JOIN messages m ON m.message_id = r.reported_message_id
      LEFT JOIN skilled_profiles sp ON sp.skilled_id = r.reported_skill_id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    if (type) {
      query += ` AND r.type = ?`;
      params.push(type);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [reports] = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM reports WHERE 1=1`;
    const countParams = [];

    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (type) {
      countQuery += ` AND type = ?`;
      countParams.push(type);
    }

    const [total] = await pool.query(countQuery, countParams);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const [reports] = await pool.query(
      `SELECT 
        r.*,
        u1.firstName as reporter_firstName, u1.lastName as reporter_lastName,
        u2.firstName as reported_firstName, u2.lastName as reported_lastName,
        rat.rating,
        rat.review as rating_review,
        m.message as reported_message,
        sp.firstName as skilled_firstName, sp.lastName as skilled_lastName
      FROM reports r
      LEFT JOIN users u1 ON u1.user_id = r.reporter_id
      LEFT JOIN users u2 ON u2.user_id = r.reported_user_id
      LEFT JOIN ratings rat ON rat.rating_id = r.reported_rating_id
      LEFT JOIN messages m ON m.message_id = r.reported_message_id
      LEFT JOIN skilled_profiles sp ON sp.skilled_id = r.reported_skill_id
      WHERE r.report_id = ?`,
      [id],
    );

    if (!reports.length) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ report: reports[0] });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Resolve report (admin only)
// Resolve report (admin only)
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, admin_notes } = req.body;
    const admin_id = req.user.id;

    // Get report details
    const [reports] = await pool.query(
      `SELECT r.*, 
              u1.firstName as reporter_firstName, u1.lastName as reporter_lastName,
              u2.firstName as reported_firstName, u2.lastName as reported_lastName
       FROM reports r
       LEFT JOIN users u1 ON u1.user_id = r.reporter_id
       LEFT JOIN users u2 ON u2.user_id = r.reported_user_id
       WHERE r.report_id = ?`,
      [id],
    );

    if (!reports.length) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = reports[0];
    let actionTaken = "";
    let userAction = "";

    // Perform action based on type
    if (action === "hide_rating" && report.reported_rating_id) {
      await pool.query(
        "UPDATE ratings SET status = 'hidden' WHERE rating_id = ?",
        [report.reported_rating_id],
      );
      actionTaken = "The review has been hidden.";
      userAction = "review hidden";
    } else if (action === "remove_rating" && report.reported_rating_id) {
      await pool.query("DELETE FROM ratings WHERE rating_id = ?", [
        report.reported_rating_id,
      ]);
      actionTaken = "The review has been removed.";
      userAction = "review removed";
    } else if (action === "hide_message" && report.reported_message_id) {
      await pool.query(
        "UPDATE messages SET is_hidden = TRUE WHERE message_id = ?",
        [report.reported_message_id],
      );
      actionTaken = "The message has been hidden.";
      userAction = "message hidden";
    } else if (action === "suspend_user" && report.reported_user_id) {
      await pool.query(
        "UPDATE users SET status = 'suspended' WHERE user_id = ?",
        [report.reported_user_id],
      );
      actionTaken = "The user has been suspended.";
      userAction = "user suspended";
    } else if (action === "warn_user" && report.reported_user_id) {
      actionTaken = "A warning has been issued.";
      userAction = "warning issued";
    }

    // Update report status
    await pool.query(
      `UPDATE reports 
       SET status = 'resolved', resolved_at = NOW(), resolved_by = ?, admin_notes = ?
       WHERE report_id = ?`,
      [admin_id, admin_notes || null, id],
    );

    // Send notification to the reporter
    let reporterMessage = `Your report has been reviewed. ${actionTaken}`;
    if (admin_notes) {
      reporterMessage += `\n\nAdmin notes: ${admin_notes}`;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES (?, 'system', 'Report Resolved', ?, ?)`,
      [
        report.reporter_id,
        reporterMessage,
        JSON.stringify({
          report_id: id,
          action: "report_resolved",
          status: "resolved",
          admin_notes: admin_notes,
        }),
      ],
    );

    // Send notification to the reported user (if action was taken)
    if (
      report.reported_user_id &&
      (action === "warn_user" || action === "suspend_user")
    ) {
      let reportedMessage = "";
      if (action === "warn_user") {
        reportedMessage = `Your account has received a warning due to a report. Please review our community guidelines. ${admin_notes ? `\n\nAdmin notes: ${admin_notes}` : ""}`;
      } else if (action === "suspend_user") {
        reportedMessage = `Your account has been suspended due to a report. ${admin_notes ? `\n\nAdmin notes: ${admin_notes}` : ""}`;
      }

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES (?, 'system', 'Account Action', ?, ?)`,
        [
          report.reported_user_id,
          reportedMessage,
          JSON.stringify({
            report_id: id,
            action: userAction,
            admin_notes: admin_notes,
          }),
        ],
      );
    }

    res.json({ message: "Report resolved successfully" });
  } catch (error) {
    console.error("Error resolving report:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get report statistics (admin only)
export const getReportStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
        SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed_reports,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
        SUM(CASE WHEN type = 'user' THEN 1 ELSE 0 END) as user_reports,
        SUM(CASE WHEN type = 'profile' THEN 1 ELSE 0 END) as profile_reports,
        SUM(CASE WHEN type = 'review' THEN 1 ELSE 0 END) as review_reports,
        SUM(CASE WHEN type = 'message' THEN 1 ELSE 0 END) as message_reports
      FROM reports
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error("Error fetching report stats:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
