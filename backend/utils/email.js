import nodemailer from "nodemailer";
import "dotenv/config";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate a random 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code) => {
  try {
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
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">© 2024 Alalay Connect. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send welcome email after verification
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
            <a href="http://localhost:5173/login" style="background-color: #4e73df; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
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
