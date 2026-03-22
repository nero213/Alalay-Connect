// backend/routes/help.routes.js
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
  getSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  addTicketReply,
  updateTicketStatus,
  getUserTickets,
  getTicketStats,
} from "../controllers/help.controller.js";

const router = Router();

// User routes
router.post("/tickets", verifyToken, createSupportTicket);
router.get("/my-tickets", verifyToken, getUserTickets);
router.get("/tickets/:id", verifyToken, getSupportTicketById);
router.post("/tickets/:id/reply", verifyToken, addTicketReply);

// Admin routes
router.get("/admin/tickets", verifyToken, isAdmin, getSupportTickets);
router.get("/admin/tickets/:id", verifyToken, isAdmin, getSupportTicketById);
router.put("/admin/tickets/:id", verifyToken, isAdmin, updateTicketStatus);
router.post("/admin/tickets/:id/reply", verifyToken, isAdmin, addTicketReply);
router.get("/admin/stats", verifyToken, isAdmin, getTicketStats);

export default router;
