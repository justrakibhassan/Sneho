import nodemailer from "nodemailer";

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendBookingRequestEmail = async (email: string, name: string) => {
  const mailOptions: MailOptions = {
    from: `"Sneho Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "New Booking Request - Sneho",
    text: `Hello, you have a new booking request from parent ${name}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(
      `[Email Error] Failed to send booking request email to ${email}:`,
      err
    );
  }
};

export const sendBookingStatusEmail = async (email: string, status: string) => {
  const mailOptions: MailOptions = {
    from: `"Sneho Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Booking Status Update - Sneho",
    text: `Your booking status has been updated to: ${status}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(
      `[Email Error] Failed to send booking status email to ${email}:`,
      err
    );
  }
};

export const sendMeetingLinkEmail = async (
  email: string,
  name: string,
  link: string,
  bookingId: string | number
) => {
  const mailOptions: MailOptions = {
    from: `"Sneho Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Meeting Link - Sneho",
    text: `Hello ${name}, here is your meeting link for booking ${bookingId}: ${link}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(
      `[Email Error] Failed to send meeting link email to ${email}:`,
      err
    );
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const mailOptions: MailOptions = {
    from: `"Sneho Support" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password - Sneho",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #F97316; text-align: center;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your Sneho account. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #F97316; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Alternatively, you can copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #64748b;">${resetUrl}</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 Sneho. All rights reserved.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Message sent to ${email}: %s`, info.messageId);

    // Still log to file for verification in development
    if (process.env.NODE_ENV !== "production") {
      const fs = await import("fs");
      fs.appendFileSync(
        "reset_links.log",
        `Email: ${email}, Link: ${resetUrl} (Real email sent: ${info.messageId})\n`
      );
    }
  } catch (err: any) {
    console.error(`[Email Error] Failed to send reset email to ${email}:`, err);
    // Fallback: log to file even if real email fails (only in development)
    if (process.env.NODE_ENV !== "production") {
      try {
        const fs = await import("fs");
        fs.appendFileSync(
          "reset_links.log",
          `Email: ${email}, Link: ${resetUrl} (Real email FAILED: ${err.message})\n`
        );
      } catch (logErr) {}
    }
    throw err;
  }
};
