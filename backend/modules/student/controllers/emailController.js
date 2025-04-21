const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    console.log(`Preparing to send email to ${to}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your preferred email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true,   // <-- Add this
      debug: true,    
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text, // plain text content only
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent:', info.messageId);
    // await transporter.sendMail(mailOptions);
    // console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};


// console.log('Student email:', updatedStudent.email);

// // ✅ Send plain text email if admission confirmed
// if (flag === true && updatedStudent.email) {
//  await sendEmail({
//    to: updatedStudent.email,
//    subject: 'Admission Confirmed',
//    text: `Hi ${updatedStudent.firstName},\n\nYour admission has been successfully confirmed.\n\nRegards,\nAdmission Office`,
//  });
// }



module.exports = { sendEmail };
