// backend/utils/sendWhatsAppMessage.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = 'whatsapp:+14155238886'; // Sandbox ya approved number

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async ({ name, phone, interviewDate, topic, daysLeft }) => {
  const messageBody = 
`Hello ${name},
Your interview is scheduled on *${interviewDate}*.

📚 *Topic:* 
${topic.split(',').join('\n')}

⏳ *Days Left:* ${daysLeft}

Best of luck!`;

  try {
    const message = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${phone}`,
      body: messageBody,
    });

    console.log('✅ Message sent:', message.sid);
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error.message);
    throw error;
  }
};

module.exports = sendWhatsAppMessage;
