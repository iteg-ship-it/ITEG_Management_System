const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();



const sendEmail = async ({ to, subject, text, attachments = [] }) => {
  try {
    console.log(`Preparing to send email to ${to}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,   // <-- Add this
      debug: true,    
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text, // plain text content only
      attachments,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent:', info.messageId);
    // await transporter.sendMail(mailOptions);
    // console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};


const sendHTMLMail = async ({ to, studentName }) => {
  try {
    console.log(`Sending Level 1C clear email to ${to}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlContent = `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border-radius: 10px; border: 1px solid #eee;">
      <div style="text-align: center;">
        <img src="cid:ssismLogo" style="width: 80px; height: 80px; border-radius: 50%;" />
        <h2 style="color: #e3740f; margin: 10px 0 5px;">SSISM - ITEG Management System</h2>
        <p style="color: #555; font-size: 15px;">Level 1C Interview Cleared 🎉</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      </div>

      <p style="font-size: 16px; color: #333;">Hello <strong>${studentName}</strong>,</p>
      <p style="font-size: 15px; color: #444;">
        Congratulations! You have successfully cleared the <strong>Level 1C Interview</strong> as part of the ITEG Placement Process at SSISM.
      </p>

      <div style="background: #fff7f1; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #ffd699;">
        <p style="font-size: 15px; margin-bottom: 15px;">Keep preparing for the next levels. Your dedication is paying off!</p>
        <a href="https://ssism.org" style="text-decoration: none;">
          <button style="background-color: #f78b1f; color: white; padding: 10px 20px; font-size: 15px; border: none; border-radius: 5px; cursor: pointer;">
            Visit SSISM Portal
          </button>
        </a>
      </div>

      <p style="font-size: 14px; color: #888;">📌 This is an automated email. No action is required if you've already received this update.</p>

      <br />
      <p style="font-size: 14px; color: #333;">Regards,<br><strong style="color: #e3740f;">Team SSISM | ITEG Management</strong></p>
      <p style="font-size: 13px;">
        <a href="https://ssism.org" style="color: #007bff; text-decoration: none;">ssism.org</a> |
        <a href="mailto:support@santsingaji.org" style="color: #007bff; text-decoration: none;">support@santsingaji.org</a>
      </p>
    </div>
    `;

    const logoPath = path.join(__dirname, '..', process.env.LOGO);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "🎉 Congratulations! You cleared Level 1C Interview",
      html: htmlContent,
      attachments: [{
        path: logoPath,
        cid: 'ssismLogo'
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending Level 1C email:", err.message);
  }
};


module.exports = { sendEmail, sendHTMLMail };
