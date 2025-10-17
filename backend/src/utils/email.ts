import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const subject = 'Welcome to AeroLux!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #D4AF37;">Welcome to AeroLux, ${name}!</h1>
      <p>Thank you for joining AeroLux. We're excited to help you plan your next adventure!</p>
      <p>You can now:</p>
      <ul>
        <li>Search and book flights</li>
        <li>Find and reserve hotels</li>
        <li>Manage your bookings</li>
        <li>Track your travel history</li>
      </ul>
      <p>Happy travels!</p>
      <p>The AeroLux Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const subject = 'Password Reset - AeroLux';
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #D4AF37;">Password Reset Request</h1>
      <p>You requested a password reset for your AeroLux account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #D4AF37; color: #0A1A2F; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>The AeroLux Team</p>
    </div>
  `;

  return sendEmail(email, subject, html);
};