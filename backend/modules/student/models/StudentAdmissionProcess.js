const mongoose = require('mongoose');

const Student_Admission_process_Schema = new mongoose.Schema({
  First_name: { type: String, required: true },
  Last_name: { type: String, required: true },
  Father_name: { type: String, required: true },
  // Mother_name: { type: String, required: true },
  stream: { type: String, required: true },
  percent12th: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aadharCard: { type: String, required: true, unique: true },
  student_Mb_no: { type: String, required: true },
  father_Mb_no: { type: String, required: true },
  course: { type: String, required: true },
  track: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, required: true },
  interviewAttempts: { type: String, required: true },
  feeStatus: { type: String, required: true },
  // flag: { type: String, required: true }, // Uncomment if needed
}, { timestamps: true });

module.exports = mongoose.model('Student_Admission_process', Student_Admission_process_Schema);




