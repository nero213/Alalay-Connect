// backend/utils/email.js
import nodemailer from "nodemailer";
import "dotenv/config";

// Initialize Mailtrap Transporter
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

// Centralized Helper Function
const sendMailtrap = async (to, subject, html, logContext) => {
  try {
    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        "Alalay Connect <onboarding@alalayconnect.com>",
      to,
      subject,
      html,
    });
    console.log(`✅ ${logContext} email sent (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`❌ Mailtrap error (${logContext}):`, error.message);
    return false;
  }
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============= AUTHENTICATION EMAILS =============

export const sendPasswordResetEmail = async (email, token, name) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">Reset Your Password</h2>
      <p>Hi ${name},</p>
      <p>Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    email,
    "Reset Your Password - Alalay Connect",
    html,
    "password reset",
  );
};

export const sendVerificationEmail = async (email, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">Welcome to Alalay Connect!</h2>
      <p style="font-size: 16px; color: #333;">Please verify your email address using the code below:</p>
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
        <h1 style="font-size: 48px; letter-spacing: 10px; color: #4e73df; margin: 0;">${code}</h1>
      </div>
      <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
      <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    email,
    "Verify Your Email - Alalay Connect",
    html,
    "verification",
  );
};

export const sendWelcomeEmail = async (email, firstName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">Welcome to Alalay Connect, ${firstName}!</h2>
      <p>Your email has been successfully verified. Your account is now active!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4e73df; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
      </div>
      <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    email,
    "Welcome to Alalay Connect!",
    html,
    "welcome",
  );
};

// ============= SUPPORT TICKET EMAILS =============

export const sendNewTicketNotification = async (admins, ticketData) => {
  const adminEmails = admins.map((admin) => admin.email);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">New Support Ticket Created</h2>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Ticket ID:</strong> ${ticketData.ticket_uuid}</p>
        <p><strong>From:</strong> ${ticketData.user_name} (${ticketData.user_email})</p>
        <p><strong>Subject:</strong> ${ticketData.subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background: white; padding: 10px; border-radius: 5px;">${ticketData.message}</p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL}/admin/help" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    adminEmails,
    `New Support Ticket #${ticketData.ticket_uuid}`,
    html,
    "admin ticket notification",
  );
};

export const sendTicketReplyNotification = async (
  userEmail,
  userName,
  ticketData,
  replyMessage,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">New Reply on Your Support Ticket</h2>
      <p>Hi ${userName}, there's a new reply on ticket <strong>#${ticketData.ticket_uuid}</strong>.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="background: white; padding: 10px; border-radius: 5px;">${replyMessage}</p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL}/my-tickets/${ticketData.ticket_id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    userEmail,
    `New Reply on Support Ticket #${ticketData.ticket_uuid}`,
    html,
    "ticket reply",
  );
};

export const sendTicketStatusNotification = async (
  userEmail,
  userName,
  ticketData,
  oldStatus,
  newStatus,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">Ticket Status Updated</h2>
      <p>Hi ${userName}, ticket <strong>#${ticketData.ticket_uuid}</strong> has been updated.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Previous Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL}/my-tickets/${ticketData.ticket_id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    userEmail,
    `Support Ticket #${ticketData.ticket_uuid} Status Update`,
    html,
    "ticket status update",
  );
};

export const sendTicketAssignedNotification = async (
  adminEmail,
  adminName,
  ticketData,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4e73df; text-align: center;">Ticket Assigned to You</h2>
      <p>Hi ${adminName}, you have been assigned to handle ticket <strong>#${ticketData.ticket_uuid}</strong>.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.FRONTEND_URL}/admin/help/${ticketData.ticket_id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
    </div>`;
  return await sendMailtrap(
    adminEmail,
    `Ticket #${ticketData.ticket_uuid} Assigned to You`,
    html,
    "ticket assigned",
  );
};
