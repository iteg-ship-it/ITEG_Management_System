const Student_Admission_process= require('../models/Student_Admission_process_Schema');
const bcrypt = require('bcrypt');

// Create Super Admin
exports.createStudent_Admission_process = async (req, res) => {
  try {
    const { Full_name, fater_name,Mother_name,stream,persent12th,email, adharCard,student_Mb_no, father_Mb_no,course,track, adress} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const Student_Admission_process  = new Student_Admission_Process({
        Full_name,
        fater_name,
        Mother_name,
        stream,
        persent12th,
        email,
        adharCard,
        student_Mb_no,
        father_Mb_no,
        course,
        track, 
        adress,
        stape

    });

    await Student_Admission_process.save();
    res.status(201).json({ message: 'Student_Admission_process created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
