// routes/otpRoutes.js

const express = require('express');
const router = express.Router();
const { sendOtpToEmail, verifyEmailOtp } = require('../modules/user/controllers/otpController.js');

router.post('/send-otp-email', sendOtpToEmail);
router.post('/verify-otp-email', verifyEmailOtp);

module.exports = router;
