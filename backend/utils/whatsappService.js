const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

exports.sendInterviewNotification = async (student) => {
  try {
    const message = `नमस्ते ${student.name}!\n\nआपका अगला इंटरव्यू ${student.interviewDate} को होगा।\n\nआपको ${student.daysLeft} दिनों में "${student.topic}" पढ़कर आना है।\n\nशुभकामनाएं!`;

    await client.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${student.phone}`, // Make sure this is in international format e.g. +91xxxxxxxxxx
      body: message
    });

    console.log(`✅ WhatsApp sent to ${student.phone}`);
  } catch (error) {
    console.error("❌ WhatsApp send failed:", error);
  }
};
