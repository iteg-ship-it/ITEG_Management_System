//


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
            path: '../modules/user/helpers/Ssism_Logo.png', // Update path if needed
            cid: 'ssismLogo'
        }],
        text: `Your OTP is: ${otp} (Valid for 5 minutes)`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendEmailOtp };
