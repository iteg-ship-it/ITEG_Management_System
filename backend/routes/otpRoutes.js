// routes/otpRoutes.js

const express = require('express');
const router = express.Router();
const { sendOtpToEmail, verifyEmailOtp } = require('../modules/user/controllers/otpController.js');

router.post('/send', sendOtpToEmail);
router.post('/verify', verifyEmailOtp);

module.exports = router;
