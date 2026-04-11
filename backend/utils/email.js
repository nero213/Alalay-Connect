// backend/utils/email.js
import nodemailer from "nodemailer";
import "dotenv/config";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true, // Enable debug output
  logger: true, // Log to console
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Nodemailer transporter error:", error);
  } else {
    console.log("✅ Nodemailer transporter is ready to send emails");
  }
});
export const sendPasswordResetEmail = async (email, token, name) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password - Alalay Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, please ignore this email. This link will expire in 1 hour.</p>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendVerificationEmail = async (email, code) => {
  try {
    console.log(`📧 Attempting to send verification email to ${email}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - Alalay Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">Welcome to Alalay Connect!</h2>
          <p style="font-size: 16px; color: #333;">Please verify your email address using the code below:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h1 style="font-size: 48px; letter-spacing: 10px; color: #4e73df; margin: 0;">${code}</h1>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    console.log(`📬 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error command:", error.command);
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw error;
  }
};

export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Alalay Connect!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">Welcome to Alalay Connect, ${firstName}!</h2>
          <p style="font-size: 16px; color: #333;">Your email has been successfully verified. Your account is now active!</p>
          <p style="font-size: 16px; color: #333;">You can now:</p>
          <ul style="font-size: 16px; color: #333;">
            <li>Browse skilled professionals in your area</li>
            <li>Book services</li>
            <li>Leave reviews</li>
            <li>Create your professional profile (if you're a skilled worker)</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #4e73df; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
};

// ============= SUPPORT TICKET EMAILS =============

// Send new ticket notification to admin
export const sendNewTicketNotification = async (admins, ticketData) => {
  try {
    const adminEmails = admins.map((admin) => admin.email).join(", ");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails,
      subject: `New Support Ticket #${ticketData.ticket_uuid} - ${ticketData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">New Support Ticket Created</h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${ticketData.ticket_uuid}</p>
            <p><strong>From:</strong> ${ticketData.user_name} (${ticketData.user_email})</p>
            <p><strong>Subject:</strong> ${ticketData.subject}</p>
            <p><strong>Category:</strong> ${ticketData.category}</p>
            <p><strong>Priority:</strong> ${ticketData.priority}</p>
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 10px; border-radius: 5px;">${ticketData.message}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/help" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`New ticket notification sent to admins`);
    return true;
  } catch (error) {
    console.error("Error sending new ticket notification:", error);
    return false;
  }
};

// Send ticket reply notification to user
export const sendTicketReplyNotification = async (
  userEmail,
  userName,
  ticketData,
  replyMessage,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `New Reply on Support Ticket #${ticketData.ticket_uuid}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">New Reply on Your Support Ticket</h2>
          <p>Hi ${userName},</p>
          <p>There's a new reply on your support ticket <strong>#${ticketData.ticket_uuid}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Subject:</strong> ${ticketData.subject}</p>
            <p><strong>Reply:</strong></p>
            <p style="background: white; padding: 10px; border-radius: 5px;">${replyMessage}</p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/my-tickets/${ticketData.ticket_id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Ticket reply notification sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending ticket reply notification:", error);
    return false;
  }
};

// Send ticket status update notification
export const sendTicketStatusNotification = async (
  userEmail,
  userName,
  ticketData,
  oldStatus,
  newStatus,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Support Ticket #${ticketData.ticket_uuid} Status Update`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">Ticket Status Updated</h2>
          <p>Hi ${userName},</p>
          <p>The status of your support ticket <strong>#${ticketData.ticket_uuid}</strong> has been updated.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Subject:</strong> ${ticketData.subject}</p>
            <p><strong>Previous Status:</strong> ${oldStatus}</p>
            <p><strong>New Status:</strong> <span style="color: ${newStatus === "resolved" ? "#10b981" : "#f59e0b"}; font-weight: bold;">${newStatus}</span></p>
          </div>
          ${newStatus === "resolved" ? "<p>Your ticket has been marked as resolved. If you have any further questions, feel free to reply to this ticket.</p>" : ""}
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/my-tickets/${ticketData.ticket_id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Ticket status notification sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending ticket status notification:", error);
    return false;
  }
};

// Send ticket assigned notification
export const sendTicketAssignedNotification = async (
  adminEmail,
  adminName,
  ticketData,
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `Ticket #${ticketData.ticket_uuid} Assigned to You`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4e73df; text-align: center;">Ticket Assigned to You</h2>
          <p>Hi ${adminName},</p>
          <p>A support ticket has been assigned to you for handling.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${ticketData.ticket_uuid}</p>
            <p><strong>From:</strong> ${ticketData.user_name}</p>
            <p><strong>Subject:</strong> ${ticketData.subject}</p>
            <p><strong>Priority:</strong> <span style="color: ${ticketData.priority === "urgent" ? "#ef4444" : "#f59e0b"}">${ticketData.priority}</span></p>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/help/${ticketData.ticket_id}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
          </div>
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Ticket assigned notification sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending ticket assigned notification:", error);
    return false;
  }
};
