// backend/controllers/help.controller.js
import { pool } from "../config/db.js";
import {
  sendNewTicketNotification,
  sendTicketReplyNotification,
  sendTicketStatusNotification,
  sendTicketAssignedNotification,
} from "../utils/email.js";

// Get all support tickets
export const getSupportTickets = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        u.firstName, u.lastName, u.email, u.role,
        a.firstName as assigned_admin_firstName,
        a.lastName as assigned_admin_lastName
      FROM support_tickets t
      LEFT JOIN users u ON u.user_id = t.user_id
      LEFT JOIN users a ON a.user_id = t.assigned_to
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    query += ` ORDER BY 
      CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.created_at DESC
      LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [tickets] = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM support_tickets WHERE 1=1`;
    const countParams = [];

    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }

    if (priority) {
      countQuery += ` AND priority = ?`;
      countParams.push(priority);
    }

    const [total] = await pool.query(countQuery, countParams);

    // Get stats
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
      FROM support_tickets
    `);

    res.json({
      tickets,
      stats: stats[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get single support ticket
export const getSupportTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tickets] = await pool.query(
      `
      SELECT 
        t.*,
        u.firstName, u.lastName, u.email, u.role, u.phone,
        a.firstName as assigned_admin_firstName,
        a.lastName as assigned_admin_lastName,
        (SELECT COUNT(*) FROM support_ticket_replies WHERE ticket_id = t.ticket_id) as reply_count
      FROM support_tickets t
      LEFT JOIN users u ON u.user_id = t.user_id
      LEFT JOIN users a ON a.user_id = t.assigned_to
      WHERE t.ticket_id = ? OR t.ticket_uuid = ?
    `,
      [id, id],
    );

    if (!tickets.length) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Get replies
    const [replies] = await pool.query(
      `
      SELECT 
        r.*,
        u.firstName, u.lastName, u.role,
        a.firstName as admin_firstName,
        a.lastName as admin_lastName
      FROM support_ticket_replies r
      LEFT JOIN users u ON u.user_id = r.user_id
      LEFT JOIN users a ON a.user_id = r.admin_id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC
    `,
      [tickets[0].ticket_id],
    );

    res.json({
      ticket: tickets[0],
      replies,
    });
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// backend/controllers/help.controller.js - Update the createSupportTicket function
export const createSupportTicket = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { subject, message, category, priority = "medium" } = req.body;

    if (!subject || !message || !category) {
      return res
        .status(400)
        .json({ message: "Subject, message, and category are required" });
    }

    const ticket_uuid = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const [result] = await pool.query(
      `INSERT INTO support_tickets (ticket_uuid, user_id, subject, message, category, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [ticket_uuid, user_id, subject, message, category, priority],
    );

    // Get user info for email
    const [user] = await pool.query(
      "SELECT firstName, lastName, email FROM users WHERE user_id = ?",
      [user_id],
    );

    // Get admin emails for notification
    const [admins] = await pool.query(
      "SELECT user_id, email, firstName, lastName FROM users WHERE role = 'admin'",
    );

    // Create notifications for admins
    for (const admin of admins) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES (?, 'system', 'New Support Ticket', 
                 'New ticket #${ticket_uuid} from ${user[0].firstName} ${user[0].lastName}', 
                 ?)`,
        [
          admin.user_id,
          JSON.stringify({ ticket_id: result.insertId, ticket_uuid }),
        ],
      );
    }

    // Send email notification to admins
    await sendNewTicketNotification(admins, {
      ticket_uuid,
      user_name: `${user[0].firstName} ${user[0].lastName}`,
      user_email: user[0].email,
      subject,
      category,
      priority,
      message,
    });

    res.status(201).json({
      message: "Support ticket created successfully",
      ticket: {
        ticket_id: result.insertId,
        ticket_uuid,
        subject,
        message,
        category,
        priority,
        status: "open",
      },
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update the addTicketReply function to send emails

export const addTicketReply = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { message, is_internal_note = false } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get ticket to check if it exists and get user info
    const [tickets] = await pool.query(
      `SELECT t.*, u.email, u.firstName, u.lastName 
       FROM support_tickets t
       JOIN users u ON u.user_id = t.user_id
       WHERE t.ticket_id = ?`,
      [id],
    );

    if (!tickets.length) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticket = tickets[0];
    const isAdmin = req.user.role === "admin";

    // Add reply
    const [result] = await pool.query(
      `INSERT INTO support_ticket_replies (ticket_id, user_id, admin_id, message, is_internal_note)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        isAdmin ? null : user_id,
        isAdmin ? user_id : null,
        message,
        is_internal_note ? 1 : 0,
      ],
    );

    // Update ticket status if it was resolved
    if (ticket.status === "resolved") {
      await pool.query(
        "UPDATE support_tickets SET status = 'open' WHERE ticket_id = ?",
        [id],
      );
    }

    // Create notification for the other party with full ticket details
    const notificationUserId = isAdmin
      ? ticket.user_id
      : ticket.assigned_to || null;

    if (notificationUserId) {
      const notificationData = {
        ticket_id: id,
        ticket_uuid: ticket.ticket_uuid,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        reply_message: message, // This is the admin's response
        original_message: ticket.message, // The original user message
        reply_type: isAdmin ? "admin_reply" : "user_reply",
      };

      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, data)
         VALUES (?, 'support', 'New Reply on Ticket', 
                 '${isAdmin ? "Admin" : ticket.firstName} replied to your ticket #${ticket.ticket_uuid}', 
                 ?)`,
        [notificationUserId, JSON.stringify(notificationData)],
      );
    }

    res.status(201).json({
      message: "Reply added successfully",
      reply: {
        reply_id: result.insertId,
        message,
        is_internal_note,
        created_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error adding ticket reply:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update the updateTicketStatus function to send emails
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assigned_to } = req.body;

    // Get current ticket info before update
    const [current] = await pool.query(
      `SELECT t.*, u.email, u.firstName, u.lastName 
       FROM support_tickets t
       JOIN users u ON u.user_id = t.user_id
       WHERE t.ticket_id = ?`,
      [id],
    );

    if (!current.length) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const ticket = current[0];
    const oldStatus = ticket.status;

    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }

    if (priority) {
      updates.push("priority = ?");
      params.push(priority);
    }

    if (assigned_to !== undefined) {
      updates.push("assigned_to = ?");
      params.push(assigned_to || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await pool.query(
      `UPDATE support_tickets SET ${updates.join(", ")} WHERE ticket_id = ?`,
      params,
    );

    // Add resolution time if resolved
    if (status === "resolved") {
      await pool.query(
        "UPDATE support_tickets SET resolved_at = NOW() WHERE ticket_id = ?",
        [id],
      );
    }

    // Send email notification for status change
    if (status && status !== oldStatus) {
      await sendTicketStatusNotification(
        ticket.email,
        ticket.firstName,
        {
          ticket_uuid: ticket.ticket_uuid,
          subject: ticket.subject,
          ticket_id: id,
        },
        oldStatus,
        status,
      );
    }

    // Send email if ticket is assigned to admin
    if (assigned_to && assigned_to !== ticket.assigned_to) {
      const [admin] = await pool.query(
        "SELECT email, firstName FROM users WHERE user_id = ?",
        [assigned_to],
      );
      if (admin.length) {
        await sendTicketAssignedNotification(
          admin[0].email,
          admin[0].firstName,
          {
            ticket_uuid: ticket.ticket_uuid,
            subject: ticket.subject,
            user_name: `${ticket.firstName} ${ticket.lastName}`,
            priority: priority || ticket.priority,
            ticket_id: id,
          },
        );
      }
    }

    res.json({ message: "Ticket updated successfully" });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user's own tickets
export const getUserTickets = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [tickets] = await pool.query(
      `
      SELECT t.*, 
             a.firstName as assigned_admin_firstName,
             a.lastName as assigned_admin_lastName,
             (SELECT COUNT(*) FROM support_ticket_replies WHERE ticket_id = t.ticket_id) as reply_count
      FROM support_tickets t
      LEFT JOIN users a ON a.user_id = t.assigned_to
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [user_id, parseInt(limit), offset],
    );

    const [total] = await pool.query(
      "SELECT COUNT(*) as total FROM support_tickets WHERE user_id = ?",
      [user_id],
    );

    res.json({
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].total,
        pages: Math.ceil(total[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get ticket stats for dashboard
export const getTicketStats = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
        AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_resolution_hours
      FROM support_tickets
    `);

    const [recent] = await pool.query(`
      SELECT COUNT(*) as count, DATE(created_at) as date
      FROM support_tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    res.json({
      stats: stats[0],
      recent,
    });
  } catch (error) {
    console.error("Error fetching ticket stats:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
