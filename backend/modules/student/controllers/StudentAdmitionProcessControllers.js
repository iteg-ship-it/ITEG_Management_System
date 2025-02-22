const Student_Admission_process = require('../models/StudentAdmissionProcess');
const bcrypt = require('bcrypt');

// Create Super Admin
exports.createStudent_Admission_process = async (req, res) => {
  try {
    const { First_name, Last_name, Father_name,
      //  Mother_name, 
      stream, percent12th, email, aadharCard, student_Mb_no, father_Mb_no, course, track, address, status } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10);

    const studentAdmission = new Student_Admission_process({
      First_name,
      Last_name,
      Father_name,
      // Mother_name,
      stream,
      percent12th,
      email,
      aadharCard,
      student_Mb_no,
      father_Mb_no,
      course,
      track,
      status,
      address,
    });

    await studentAdmission.save();
    res.status(201).json({ message: 'Student Admission Process created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
