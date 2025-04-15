const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  levelNo: { type: String, required: true },
  noOfAttempts: { type: Number, default: 0 },
  marks: { type: Number, default: 0 },
  remark: { type: String },
  date: { type: Date },
  result: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' }
});

const placedInfoSchema = new mongoose.Schema({
  companyName: { type: String },
  salary: { type: Number },
  location: { type: String }
});

const interviewRecordSchema = new mongoose.Schema({
  companyName: { type: String },
  interviewDate: { type: Date },
  remark: { type: String },
  result: { type: String, enum: ['Selected', 'Rejected', 'Pending'], default: 'Pending' },
  location: { type: String },
  jobProfile: { type: String }
});

const AdmittedStudentSchema = new mongoose.Schema({
  admissionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentAdmissionProcess",
    required: true,
    unique: true
  },

  fullName: { type: String, required: true },
  stream: { type: String, required: true },
  course: { type: String, required: true },
  fatherName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  email: { type: String, required: true },

  level: [levelSchema],
  techno: { type: String },
  attendancePercentage: { type: Number, min: 0, max: 100 },
  placedInfo: placedInfoSchema,
  // permission: permissionSchema,
  interviewRecord: [interviewRecordSchema],
  readinessStatus: { type: String, enum: ['Ready', 'Not Ready'], default: 'Not Ready' }

}, { timestamps: true });

module.exports = mongoose.model("AdmittedStudent", AdmittedStudentSchema);
