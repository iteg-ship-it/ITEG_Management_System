const mongoose = require('mongoose');

const Student_Admission_process_Schema  = new mongoose.Schema({
  
  Full_name: { type: String, required: true },
  fater_name: { type: String, required: true },
  Mother_name: { type: String, required: true },
  stream: { type: String, required: true },
  persent12th: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  adharCard: { type: String, required: true, unique: true },
  student_Mb_no: { type: String, required: true },
  father_Mb_no: { type: String, required: true },
  course:{type:String,requested:true},
  track:{type:String,request:true},
 adress: { type: String, required: true },
 stape: { type: String, required: true },
 Flage : { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Admission_process',Student_Admission_process_Schema);
