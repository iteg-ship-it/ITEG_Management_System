// backend/modules/student/controllers/whatsapp.controller.js
const sendWhatsAppMessage = require('../../../utils/sendWhatsAppMessage');

const sendResultMessage = async (req, res) => {
  const { name, phone, interviewDate, topic, daysLeft } = req.body;

  try {
    // Optional: Save result to DB here if needed

    // Send WhatsApp message
    await sendWhatsAppMessage({ name, phone, interviewDate, topic, daysLeft });

    res.status(200).json({ message: 'WhatsApp message sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send WhatsApp message', detail: err.message });
  }
};

module.exports = { sendResultMessage };
