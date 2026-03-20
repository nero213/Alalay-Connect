import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  createBooking,
  getClientBookings,
  getSkilledBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  getAvailableSlots,
  rejectBooking, // Add this import
} from "../controllers/booking.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Booking CRUD
router.post("/", createBooking);
router.get("/client", getClientBookings);
router.get("/skilled", getSkilledBookings);
router.get("/:id", getBookingById);

// Booking actions
router.put("/:id/status", updateBookingStatus);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/reject", rejectBooking); // Add this line
router.put("/:id/reschedule", rescheduleBooking);

// Availability
router.get("/available/:skilled_id", getAvailableSlots);

export default router;
