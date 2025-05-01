// controllers/otpController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
// const { generateToken, generateRefreshToken } = require('../controllers/userController');
const { generateOTP, sendEmailOtp } = require('../helpers/sendOtp');
const User = require('../models/user');

// Temporary in-memory store (replace with DB or Redis in real project)
const otpStore = new Map(); // email => { otp, expiresAt }
const otpAttempts = new Map(); // email => attempts
// const otpStore = new Map(); // email => { otp, expiresAt }
const sendOtpToEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        // ✅ Check if email exists in database
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // ✅ Check OTP attempt limit
        const attempts = otpAttempts.get(email) || 0;
        if (attempts >= 3) {
            return res.status(429).json({ message: 'You have exceeded the maximum OTP request limit' });
        }

        // ✅ Generate and send OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email, { otp, expiresAt });

        // ✅ Increase attempt count
        otpAttempts.set(email, attempts + 1);

        await sendEmailOtp(email, otp);
        res.status(200).json({ message: 'OTP sent to registered email' });
    } catch (err) {
        console.error('Error sending OTP:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const verifyEmailOtp = async (req, res) => {
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

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // ✅ Generate JWT tokens
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Save refreshToken in database
        user.refreshToken = refreshToken;
        await user.save();

        // ✅ Clear OTP from memory
        otpStore.delete(email);

        res.status(200).json({
            message: "OTP verified successfully. Login success.",
            token,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                department: user.department,
            },
        });
    } catch (error) {
        console.error("OTP verify error:", error.message);
        res.status(500).json({ message: "OTP verification failed", error: error.message });
    }
};
module.exports = { sendOtpToEmail, verifyEmailOtp };
