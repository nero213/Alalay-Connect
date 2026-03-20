import { pool } from "../config/db.js";

// Create a notification
export const createNotification = async (
  userId,
  type,
  title,
  message,
  data = null,
) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, type, title, message, data ? JSON.stringify(data) : null],
    );
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

// Booking notifications with detailed information
export const notifyNewBooking = async (skilledUserId, bookingData) => {
  const title = "New Booking Request";
  const message = `${bookingData.clientName} sent you a booking request for ${new Date(bookingData.service_date).toLocaleString()}`;

  return await createNotification(skilledUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "new_booking",
    clientName: bookingData.clientName,
    service_date: bookingData.service_date,
  });
};

export const notifyBookingConfirmed = async (clientUserId, bookingData) => {
  const title = "Booking Confirmed";
  const message = `${bookingData.skilledName} has confirmed your booking`;

  return await createNotification(clientUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "confirmed",
    skilledName: bookingData.skilledName,
  });
};

export const notifyBookingCompleted = async (clientUserId, bookingData) => {
  const title = "Booking Completed";
  const message = `${bookingData.skilledName} has marked your booking as completed`;

  return await createNotification(clientUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "completed",
    skilledName: bookingData.skilledName,
  });
};

export const notifyBookingCancelledByClient = async (
  skilledUserId,
  bookingData,
) => {
  const title = "Booking Cancelled";
  const message = `${bookingData.clientName} has cancelled their booking${bookingData.reason ? `: ${bookingData.reason}` : ""}`;

  return await createNotification(skilledUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "cancelled_by_client",
    clientName: bookingData.clientName,
    reason: bookingData.reason,
  });
};

export const notifyBookingCancelledBySkilled = async (
  clientUserId,
  bookingData,
) => {
  const title = "Booking Cancelled";
  const message = `${bookingData.skilledName} has cancelled your booking`;

  return await createNotification(clientUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "cancelled_by_skilled",
    skilledName: bookingData.skilledName,
  });
};

export const notifyBookingRejected = async (clientUserId, bookingData) => {
  const title = "Booking Request Declined";
  const message = `${bookingData.skilledName} has declined your booking request${bookingData.reason ? `: ${bookingData.reason}` : ""}`;

  return await createNotification(clientUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "rejected",
    skilledName: bookingData.skilledName,
    reason: bookingData.reason,
  });
};

export const notifyBookingRescheduled = async (skilledUserId, bookingData) => {
  const title = "Booking Rescheduled";
  const message = `${bookingData.clientName} has rescheduled their booking to ${new Date(bookingData.new_date).toLocaleString()}${bookingData.reason ? `: ${bookingData.reason}` : ""}`;

  return await createNotification(skilledUserId, "booking", title, message, {
    booking_id: bookingData.booking_id,
    type: "rescheduled",
    clientName: bookingData.clientName,
    new_date: bookingData.new_date,
    reason: bookingData.reason,
  });
};
