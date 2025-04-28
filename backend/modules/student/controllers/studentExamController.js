// modules/student/studentExamController.js

const { sendInterviewNotification } = require('D:/GitHub/ITEG_Management_System/backend/utils/whatsappService.js');

exports.submitExam = async (req, res) => {
  try {
    const { studentId, answers } = req.body;

    const student = await Student.findById(studentId);

    // Exam Save Logic
    const exam = new Exam({
      student: studentId,
      answers,
      submittedAt: new Date()
    });
    await exam.save();

    // Interview Info (Yeh aapka logic hoga - static/dynamic)
    const interviewDate = '22 April 2025';
    const topic = 'Node.js & MongoDB';
    const daysLeft = 4;

    // WhatsApp Message bhejna
    await sendInterviewNotification({
      name: student.name,
      phone: student.phoneNumber,
      interviewDate,
      topic,
      daysLeft
    });

    res.status(200).json({ success: true, message: 'Exam submitted & WhatsApp sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Something went wrong' });
  }
};
