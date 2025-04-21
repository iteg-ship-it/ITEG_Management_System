// webhookRoutes.js or inside your main route file
const express = require("express");
const router = express.Router();
const admissionController = require('../modules/student/controllers/admissionProcessStudentControllers'); // adjust path
const { testWhatsAppMessage } = require('../modules/student/controllers/whatsappTestController'); // adjust path
const { sendInterviewNotification } = require('D:/GitHub/ITEG_Management_System/backend/utils/whatsappService.js'); // adjust path

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;


router.post("/receive/data",admissionController.addAdmission);
router.post('/test-whatsapp', testWhatsAppMessage);
router.post('/send-interview-notification', sendInterviewNotification);


module.exports = router;
