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



// helpers/sendOtp.js

const nodemailer = require('nodemailer');

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
async function sendEmailOtp(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // your email
            pass: process.env.EMAIL_PASS,  // app password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendEmailOtp };
