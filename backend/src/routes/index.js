const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const permissionRoutes = require('./permissionRoutes');
const studentRoutes = require('./studentRoutes');
const studentAdmissionRoutes = require('./studentAdmissionProcessRoutes');
const otpRoutes = require('./otpRoutes');
const faceAuthRoutes = require('./faceAuthRoutes');
const reportCardRoutes = require('./reportCardRoutes');
const protectedRoutes = require('./protectedRoutes');
const webhookRoutes = require('./webhookRoutes');

// Mount routes
router.use('/user', userRoutes);
router.use('/permissions', permissionRoutes);
router.use('/user/otp', otpRoutes);
router.use('/admitted/students', studentRoutes);
router.use('/admission/students', studentAdmissionRoutes);
router.use('/face-auth', faceAuthRoutes);
router.use('/reportcards', reportCardRoutes);
router.use('/protected', protectedRoutes);

// Webhook routes
router.use('/admission/students/webhook', webhookRoutes);
router.use('/admitted/students/webhook', webhookRoutes);

module.exports = router;