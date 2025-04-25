// const axios = require("axios");
// const qs = require("qs");

// const sendOtp = async (mobileNo, otp) => {
//   try {
//     const response = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       qs.stringify({
//         variables_values: otp,
//         route: "otp",
//         numbers: mobileNo,
//       }),
//       {
//         headers: {
//           Authorization: process.env.FAST2SMS_API_KEY,
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("Failed to send OTP:", error.response?.data || error.message);
//     throw error;
//   }
// };

// module.exports = sendOtp;



// // helpers/sendOtp.js

// const nodemailer = require('nodemailer');

// // Generate 6-digit OTP
// function generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // Send OTP via Email
// async function sendEmailOtp(email, otp) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,  // your email
//             pass: process.env.EMAIL_PASS,  // app password
//         }
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Your OTP Code',
//         text: `Your OTP code is: ${otp}`,
//     };

//     await transporter.sendMail(mailOptions);
// }

// module.exports = { generateOTP, sendEmailOtp };




// // helpers/sendOtp.js

// const nodemailer = require('nodemailer');

// function generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// async function sendEmailOtp(email, otp) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         }
//     });

//     const mailOptions = {
//         from: `"ITEG Management System" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: 'Your OTP for Email Verification',
//         text: `
// Hello,

// You have requested to verify your email address on the ITEG Management System.

// 🔐 Your One Time Password (OTP) is: ${otp}

// This OTP is valid for the next 5 minutes. Please do not share this code with anyone.

// If you did not request this, please ignore this message or contact our support team.

// Thanks & Regards,  
// ITEG Management System  
// santsingaji.org | support@santsingaji.org
//         `.trim()
//     };

//     await transporter.sendMail(mailOptions);
// }

// module.exports = { generateOTP, sendEmailOtp };








// // helpers/sendOtp.js

// const nodemailer = require('nodemailer');

// function generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// async function sendEmailOtp(email, otp) {
//     const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         }
//     });

//     const mailOptions = {
//         from: `"ITEG Management System" <${process.env.EMAIL_USER}>`,
//         to: email,
//         subject: '🔐 Your OTP for Email Verification - ITEG Management System',
//         html: `
//             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
//                 <h2 style="color: #333; text-align: center;">ITEG Management System</h2>
//                 <hr style="border: none; border-top: 1px solid #ccc;" />

//                 <p>Hello,</p>

//                 <p>You have requested to verify your email address on the <strong>ITEG Management System</strong>.</p>

//                 <div style="text-align: center; margin: 30px 0;">
//                     <p style="font-size: 16px; margin-bottom: 10px;">Your One Time Password (OTP) is:</p>
//                     <div style="font-size: 28px; font-weight: bold; color: #2d89ef; letter-spacing: 4px;">${otp}</div>
//                     <p style="font-size: 12px; color: #666;">Valid for the next 5 minutes only.</p>
//                 </div>

//                 <p><strong>⚠️ Do not share this OTP with anyone.</strong></p>

//                 <p>If you did not request this, you can safely ignore this email or contact our support team.</p>

//                 <br />
//                 <p style="color: #555;">Thanks & Regards,</p>
//                 <p style="font-weight: bold;">ITEG Management System</p>
//                 <p style="font-size: 12px; color: #888;">santsingaji.org | support@santsingaji.org</p>
//             </div>
//         `,
//         text: `Your OTP is: ${otp} (Valid for 5 minutes)` // fallback for non-HTML email clients
//     };

//     await transporter.sendMail(mailOptions);
// }

// module.exports = { generateOTP, sendEmailOtp };






const nodemailer = require('nodemailer');

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailOtp(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: `"ITEG Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Your OTP for Email Verification - SSISM',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 400px; margin: auto; padding: 30px; border-radius: 12px; background: #ffffff; border: 0.5px solid rgb(184, 182, 182); box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                
                <div style="text-align: center;">
                    <img src="cid:ssismLogo" alt="SSISM Logo" width="80" style="margin-bottom: 10px;" />
                    <h2 style="color: #f57c00; margin: 10px 0 5px;">SSISM - ITEG Management System</h2>
                    <p style="color: #666; font-size: 14px;">Secure One-Time Password (OTP) for verification</p>
                </div>

                <hr style="border: none; border-top: 1px solid #f2a365; margin: 20px 0;" />

                <p>Hello,</p>
                <p>You have requested to verify your email address for accessing <strong>ITEG Management System</strong>.</p>

                <div style="background: #fff7ed; padding: 14px; border-radius: 8px; text-align: center; margin: 19px 0; border: 0.5px solid rgb(184, 182, 182);">
                    <p style="font-size: 16px; margin-bottom: 10px; color: #555;">Your OTP is:</p>
                    <div style="font-size: 20px; font-weight: bold; color: #e65100; letter-spacing: 4px;">${otp}</div>
                    <p style="font-size: 12px; color: #999;">(Valid for 5 minutes)</p>
                </div>

                <p style="color: #444;">⚠️ <strong>Please do not share this OTP with anyone.</strong> If you did not request this OTP, you can ignore this message or contact our support.</p>

                <br />
                <p style="color: #555;">Regards,</p>
                <p style="font-weight: bold; color: #e65100;">Team SSISM | ITEG Management</p>
                <p style="font-size: 12px; color: #999;">ssism.org | support@santsingaji.org</p>
            </div>
        `,
        attachments: [{
            // filename: 'Ssism_Logo.png',
            path: 'D:/GitHub/ITEG_Management_System/backend/modules/user/helpers/Ssism_Logo.png', // Update path if needed
            cid: 'ssismLogo'
        }],
        text: `Your OTP is: ${otp} (Valid for 5 minutes)`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendEmailOtp };
