// backend/controllers/whatsappTestController.js

const { sendInterviewNotification } = require('D:/GitHub/ITEG_Management_System/backend/utils/whatsappService.js'); // Adjust the path as necessary

exports.testWhatsAppMessage = async (req, res) => {
  try {
    // Dummy student data (change this to your Twilio verified number)
    const student = {
      name: "Shivalika Ashapure",
      phone: "+916265598762", // <-- Change this to your test WhatsApp number
      interviewDate: "24 April 2025",
      topic: "C language content YouTube Playlist 👇 ( Only first 15 vedios ) https://youtube.com/playlist?list=PLu0W_9lII9aiXlHcLx-mDH1Qul38wD3aR&si=UicvvselkXhVVVwV,                 10 hours Video 👇 ( Watch only starting 4 hours) https://youtu.be/irqbmMNs2Bo?si=sFzIwuDLDtKoE6MB,               Website Link👇 https://www.w3schools.com/c/c_intro.php, https://www.javatpoint.com/c-programming-language-tutorial",
      daysLeft: 5
    };

    await sendInterviewNotification(student);

    res.status(200).json({ success: true, message: "WhatsApp message sent!" });
  } catch (err) {
    console.error("Test WhatsApp Error:", err);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
};
