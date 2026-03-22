// backend/controllers/booking.controller.js
import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import {
  notifyNewBooking,
  notifyBookingConfirmed,
  notifyBookingCompleted,
  notifyBookingCancelledByClient,
  notifyBookingCancelledBySkilled,
  notifyBookingRejected,
  notifyBookingRescheduled,
} from "../utils/notificationHelper.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.log("❌ No user found in token");
      return res.status(401).json({ message: "User not authenticated" });
    }

    const client_id = req.user.id;
    console.log("3. Client ID:", client_id);

    const {
      skilled_id,
      service_date,
      duration,
      location,
      address,
      barangay,
      city,
      latitude,
      longitude,
      notes,
      total_amount,
    } = req.body;

    console.log("4. Booking data:", {
      skilled_id,
      service_date,
      duration,
      location,
      address,
      barangay,
      city,
      latitude,
      longitude,
      notes,
      total_amount,
    });

    // Validate required fields
    if (!skilled_id || !service_date || !duration) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        message: "Skilled ID, service date, and duration are required",
      });
    }

    // Check if skilled profile exists
    console.log("5. Checking skilled profile with ID:", skilled_id);
    const [skilled] = await pool.query(
      "SELECT * FROM skilled_profiles WHERE skilled_id = ?",
      [skilled_id],
    );
    console.log("6. Skilled profile result:", skilled);

    if (!skilled.length) {
      console.log("❌ Skilled profile not found");
      return res.status(404).json({
        message: "Skilled professional not found",
      });
    }

    // Check if approved
    if (skilled[0].verification_status !== "approved") {
      console.log(
        "❌ Skilled profile not approved. Status:",
        skilled[0].verification_status,
      );
      return res.status(400).json({
        message: "Skilled professional is not approved yet",
      });
    }

    // Check if client is trying to book themselves
    console.log("7. Checking if client is booking themselves");
    const [isSelf] = await pool.query(
      "SELECT * FROM skilled_profiles WHERE skilled_id = ? AND user_id = ?",
      [skilled_id, client_id],
    );
    console.log("8. Self-booking check:", isSelf);

    if (isSelf.length) {
      console.log("❌ Client trying to book themselves");
      return res.status(400).json({
        message: "You cannot book yourself",
      });
    }

    // Check for conflicting bookings
    console.log("9. Checking for conflicts at:", service_date);
    const [conflicts] = await pool.query(
      `SELECT * FROM bookings 
       WHERE skilled_id = ? 
       AND status IN ('pending', 'confirmed')
       AND service_date BETWEEN DATE_SUB(?, INTERVAL 2 HOUR) AND DATE_ADD(?, INTERVAL 2 HOUR)`,
      [skilled_id, service_date, service_date],
    );
    console.log("10. Conflicts found:", conflicts.length);

    if (conflicts.length > 0) {
      console.log("❌ Time slot conflicts");
      return res.status(400).json({
        message: "The skilled professional is not available at this time",
      });
    }

    // Create booking
    console.log("11. Creating booking...");
    const booking_uuid = uuidv4();
    console.log("12. Generated UUID:", booking_uuid);

    const [result] = await pool.query(
      `INSERT INTO bookings (
        booking_uuid, client_id, skilled_id, service_date, duration,
        location, address, barangay, city, latitude, longitude,
        notes, total_amount, status, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        booking_uuid,
        client_id,
        skilled_id,
        service_date,
        duration,
        location || null,
        address || null,
        barangay || null,
        city || null,
        latitude || null,
        longitude || null,
        notes || null,
        total_amount || null,
      ],
    );
    console.log("13. Insert result:", result);

    // Get the created booking with all necessary info for notifications
    console.log("14. Fetching created booking with ID:", result.insertId);
    const [booking] = await pool.query(
      `SELECT b.*, 
              u.firstName as client_firstName, u.lastName as client_lastName,
              sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
              sp.user_id as skilled_user_id,
              sp.profile_image as skilled_image
       FROM bookings b
       JOIN users u ON u.user_id = b.client_id
       JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
       WHERE b.booking_id = ?`,
      [result.insertId],
    );
    console.log("15. Created booking:", booking[0]);

    // Send notification to skilled worker using helper
    await notifyNewBooking(booking[0].skilled_user_id, {
      booking_id: booking[0].booking_id,
      clientName: `${booking[0].client_firstName} ${booking[0].client_lastName}`,
      service_date: booking[0].service_date,
    });
    console.log("16. Notification sent to skilled worker");

    console.log("✅ Booking created successfully!");
    res.status(201).json({
      message: "Booking created successfully",
      booking: booking[0],
    });
  } catch (error) {
    console.error("❌ ERROR in createBooking:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Get client's bookings (for residents)
export const getClientBookings = async (req, res) => {
  try {
    const client_id = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT b.*, 
             sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
             sp.profile_image as skilled_image,
             sp.phone as skilled_phone,
             sp.email as skilled_email,
             sp.skilled_id,
             (SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
              FROM skilled_profile_skills sps
              JOIN skills s ON s.skill_id = sps.skill_id
              WHERE sps.skilled_id = sp.skilled_id) as skills
      FROM bookings b
      JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
      WHERE b.client_id = ?
    `;

    const params = [client_id];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [bookings] = await pool.query(query, params);

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE client_id = ?`,
      [client_id],
    );

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching client bookings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get skilled worker's bookings
export const getSkilledBookings = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get skilled_id from user_id
    const [skilled] = await pool.query(
      "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
      [user_id],
    );

    if (!skilled.length) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    const skilled_id = skilled[0].skilled_id;

    let query = `
      SELECT b.*, 
             u.firstName as client_firstName, u.lastName as client_lastName,
             u.phone as client_phone,
             u.email as client_email,
             u.profile_image as client_image
      FROM bookings b
      JOIN users u ON u.user_id = b.client_id
      WHERE b.skilled_id = ?
    `;

    const params = [skilled_id];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [bookings] = await pool.query(query, params);

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM bookings WHERE skilled_id = ?`,
      [skilled_id],
    );

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching skilled bookings:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get booking details by ID
// backend/controllers/booking.controller.js - Update getBookingById
// backend/controllers/booking.controller.js - Update getBookingById
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [bookings] = await pool.query(
      `SELECT 
        b.*,
        u.firstName as client_firstName, 
        u.lastName as client_lastName,
        u.phone as client_phone, 
        u.email as client_email,
        u.profile_image as client_image,
        u.role as client_role,
        (SELECT skilled_id FROM skilled_profiles WHERE user_id = u.user_id) as client_skilled_id,
        (SELECT profile_image FROM skilled_profiles WHERE user_id = u.user_id) as client_skilled_image, 
        sp.firstName as skilled_firstName, 
        sp.lastName as skilled_lastName,
        sp.profile_image as skilled_image,
        sp.skilled_id,
        sp.user_id as skilled_user_id,
        sp.phone as skilled_phone,
        sp.email as skilled_email,
        (SELECT AVG(rating) FROM ratings WHERE skilled_id = sp.skilled_id) as skilled_rating,
        (SELECT COUNT(*) FROM ratings WHERE skilled_id = sp.skilled_id) as skilled_reviews,
        (SELECT AVG(rating) FROM ratings WHERE client_id = u.user_id) as client_rating,
        (SELECT COUNT(*) FROM ratings WHERE client_id = u.user_id) as client_reviews,
        (SELECT GROUP_CONCAT(s.name SEPARATOR ', ')
         FROM skilled_profile_skills sps
         JOIN skills s ON s.skill_id = sps.skill_id
         WHERE sps.skilled_id = sp.skilled_id) as skills
      FROM bookings b
      JOIN users u ON u.user_id = b.client_id
      JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
      WHERE b.booking_id = ? OR b.booking_uuid = ?`,
      [id, id],
    );

    if (!bookings.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookings[0];

    // Check if user has permission to view this booking
    if (booking.client_id !== user_id && booking.skilled_user_id !== user_id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update booking status (for skilled worker)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user.id;

    // Get skilled_id from user_id
    const [skilled] = await pool.query(
      "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
      [user_id],
    );

    if (!skilled.length) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    const skilled_id = skilled[0].skilled_id;

    // Check if booking exists and belongs to this skilled worker
    const [booking] = await pool.query(
      `SELECT b.*, 
              u.firstName as client_firstName, u.lastName as client_lastName,
              sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
              u.user_id as client_user_id
       FROM bookings b
       JOIN users u ON u.user_id = b.client_id
       JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
       WHERE b.booking_id = ? AND b.skilled_id = ?`,
      [id, skilled_id],
    );

    if (!booking.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Validate status transition
    const validStatuses = ["confirmed", "completed", "cancelled", "no_show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update status
    await pool.query("UPDATE bookings SET status = ? WHERE booking_id = ?", [
      status,
      id,
    ]);

    // Send notifications based on status using helpers
    const bookingData = {
      booking_id: id,
      skilledName: `${booking[0].skilled_firstName} ${booking[0].skilled_lastName}`,
      clientName: `${booking[0].client_firstName} ${booking[0].client_lastName}`,
    };

    switch (status) {
      case "confirmed":
        await notifyBookingConfirmed(booking[0].client_user_id, bookingData);
        break;
      case "completed":
        await notifyBookingCompleted(booking[0].client_user_id, bookingData);
        break;
      case "cancelled":
        await notifyBookingCancelledBySkilled(
          booking[0].client_user_id,
          bookingData,
        );
        break;
    }

    res.json({
      message: `Booking ${status} successfully`,
      status,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Cancel booking (for client)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user_id = req.user.id;

    // Check if booking exists and belongs to this client
    const [booking] = await pool.query(
      `SELECT b.*, 
              u.firstName as client_firstName, u.lastName as client_lastName,
              sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
              sp.user_id as skilled_user_id
       FROM bookings b
       JOIN users u ON u.user_id = b.client_id
       JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
       WHERE b.booking_id = ? AND b.client_id = ?`,
      [id, user_id],
    );

    if (!booking.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Can only cancel pending or confirmed bookings
    if (!["pending", "confirmed"].includes(booking[0].status)) {
      return res.status(400).json({
        message: `Cannot cancel booking with status: ${booking[0].status}`,
      });
    }

    // Update status to cancelled
    await pool.query(
      "UPDATE bookings SET status = 'cancelled', notes = CONCAT(notes, ?) WHERE booking_id = ?",
      [reason ? `\nCancellation reason: ${reason}` : "", id],
    );

    // Send notification to skilled worker using helper
    await notifyBookingCancelledByClient(booking[0].skilled_user_id, {
      booking_id: id,
      clientName: `${booking[0].client_firstName} ${booking[0].client_lastName}`,
      reason: reason || "No reason provided",
    });

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Reject booking (for skilled worker to decline)
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user_id = req.user.id;

    // Get skilled_id from user_id
    const [skilled] = await pool.query(
      "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
      [user_id],
    );

    if (!skilled.length) {
      return res.status(404).json({ message: "Skilled profile not found" });
    }

    const skilled_id = skilled[0].skilled_id;

    // Check if booking exists and belongs to this skilled worker
    const [booking] = await pool.query(
      `SELECT b.*, 
              u.firstName as client_firstName, u.lastName as client_lastName,
              sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
              u.user_id as client_user_id
       FROM bookings b
       JOIN users u ON u.user_id = b.client_id
       JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
       WHERE b.booking_id = ? AND b.skilled_id = ?`,
      [id, skilled_id],
    );

    if (!booking.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Can only reject pending bookings
    if (booking[0].status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject booking with status: ${booking[0].status}`,
      });
    }

    // Update status to cancelled (rejected)
    await pool.query(
      "UPDATE bookings SET status = 'cancelled', notes = CONCAT(notes, ?) WHERE booking_id = ?",
      [
        reason
          ? `\nRejection reason: ${reason}`
          : "Booking declined by professional",
        id,
      ],
    );

    // Send notification to client using helper
    await notifyBookingRejected(booking[0].client_user_id, {
      booking_id: id,
      skilledName: `${booking[0].skilled_firstName} ${booking[0].skilled_lastName}`,
      reason: reason || "Not specified",
    });

    res.json({ message: "Booking rejected successfully" });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Reschedule booking
export const rescheduleBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, reason } = req.body;
    const user_id = req.user.id;

    if (!new_date) {
      return res.status(400).json({ message: "New date is required" });
    }

    // Check if booking exists and belongs to this client
    const [booking] = await pool.query(
      `SELECT b.*, 
              u.firstName as client_firstName, u.lastName as client_lastName,
              sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
              sp.user_id as skilled_user_id
       FROM bookings b
       JOIN users u ON u.user_id = b.client_id
       JOIN skilled_profiles sp ON sp.skilled_id = b.skilled_id
       WHERE b.booking_id = ? AND b.client_id = ?`,
      [id, user_id],
    );

    if (!booking.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Can only reschedule pending or confirmed bookings
    if (!["pending", "confirmed"].includes(booking[0].status)) {
      return res.status(400).json({
        message: `Cannot reschedule booking with status: ${booking[0].status}`,
      });
    }

    // Check for conflicts at new time
    const [conflicts] = await pool.query(
      `SELECT * FROM bookings 
       WHERE skilled_id = ? 
       AND booking_id != ?
       AND status IN ('pending', 'confirmed')
       AND service_date BETWEEN DATE_SUB(?, INTERVAL 2 HOUR) AND DATE_ADD(?, INTERVAL 2 HOUR)`,
      [booking[0].skilled_id, id, new_date, new_date],
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        message: "The skilled professional is not available at the new time",
      });
    }

    // Update booking with new date and set status to pending for confirmation
    await pool.query(
      `UPDATE bookings 
       SET service_date = ?, 
           status = 'pending',
           notes = CONCAT(notes, ?)
       WHERE booking_id = ?`,
      [
        new_date,
        `\nRescheduled from ${booking[0].service_date} to ${new_date}. Reason: ${reason || "Not specified"}`,
        id,
      ],
    );

    // Send notification to skilled worker using helper
    await notifyBookingRescheduled(booking[0].skilled_user_id, {
      booking_id: id,
      clientName: `${booking[0].client_firstName} ${booking[0].client_lastName}`,
      new_date: new_date,
      reason: reason || "Not specified",
    });

    res.json({ message: "Booking rescheduled successfully" });
  } catch (error) {
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get available time slots for a skilled worker
export const getAvailableSlots = async (req, res) => {
  try {
    const { skilled_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get all bookings for that day
    const [bookings] = await pool.query(
      `SELECT service_date, duration 
       FROM bookings 
       WHERE skilled_id = ? 
       AND DATE(service_date) = DATE(?)
       AND status IN ('pending', 'confirmed')`,
      [skilled_id, date],
    );

    // Generate available time slots (9 AM to 6 PM, 1-hour slots)
    const allSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const slotTime = `${date} ${hour.toString().padStart(2, "0")}:00:00`;

      // Check if slot is booked
      const isBooked = bookings.some((booking) => {
        const bookingHour = new Date(booking.service_date).getHours();
        return bookingHour === hour;
      });

      allSlots.push({
        time: slotTime,
        available: !isBooked,
        hour: hour,
      });
    }

    res.json({ slots: allSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
