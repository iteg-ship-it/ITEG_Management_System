// backend/routes/whatsapp.routes.js
const express = require('express');
const router = express.Router();
const { sendResultMessage } = require('../modules/student/controllers/whatsappController');

router.post('/send_whatsapp', sendResultMessage);

module.exports = router;
