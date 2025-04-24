// controllers/otpController.js

const { generateOTP, sendEmailOtp } = require('../helpers/sendOtp');

// Temporary in-memory store (replace with DB or Redis in real project)
const otpStore = new Map(); // email => { otp, expiresAt }

const sendOtpToEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

    // Save OTP in memory
    otpStore.set(email, { otp, expiresAt });

    try {
        await sendEmailOtp(email, otp);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

const verifyEmailOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const stored = otpStore.get(email);

    if (!stored) {
        return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: 'OTP expired' });
    }

    if (stored.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    otpStore.delete(email);
    res.status(200).json({ message: 'OTP verified successfully' });
};

module.exports = { sendOtpToEmail, verifyEmailOtp };
