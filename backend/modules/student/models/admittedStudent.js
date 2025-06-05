const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  levelNo: { type: String, required: true }, // e.g., "Level 1"
  noOfAttempts: { type: Number, default: 0 },
  Theoretical_Marks: { type: Number, default: 0 },
  Practical_Marks: { type: Number, default: 0 },
  Communication_Marks: { type: Number, default: 0 },
  marks: { type: Number, default: 0 }, // total marks
  remark: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  result: {
    type: String,
    enum: ['Pass', 'Fail', 'Pending'],
    default: 'Pending'
  }
});

const placedInfoSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  salary: { type: Number, required: true },
  location: { type: String, required: true },
  jobProfile: { type: String, required: true }
});

const interviewRecordSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  interviewDate: { type: Date, required: true },
  remark: { type: String, default: "" },
  result: {
    type: String,
    enum: ['Selected', 'Rejected', 'Pending'],
    default: 'Pending'
  },
  location: { type: String, required: true },
  jobProfile: { type: String, required: true }
});

const permissionSchema = new mongoose.Schema({
  imageURL: { type: String, required: true },  // Base64 Image
  remark: { type: String, default: "" },
  uploadDate: { type: Date, default: Date.now },
  approved_by: {
    type: String,
    enum: ['super admin', 'admin', 'faculty'],
    required: true
  }
});

const AdmittedStudentSchema = new mongoose.Schema({
  admissionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentAdmissionProcess",
    required: true,
    unique: true
  },

  // 🎓 Personal Details
  prkey: { type: String, required: true, unique: true },
    image: { type: String, default: "" }, // Base64 Image
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String, required: true },
    email: { type: String },
    studentMobile: { type: String, required: true },
    parentMobile: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    aadharCard: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    track: { type: String, required: true },   
    village: { type: String, required: true },
    stream: { type: String, required: true },
    course: { type: String, required: true },
    category: { type: String, required: true },
    subject12: { type: String, required: true },
    year12: { type: String, required: true },
    percent12: { type: String },
    percent10: { type: String },
    year: { type: String, required: true, default: "first" },

  // 📚 Academic & Activity
  level: { type: [levelSchema], default: [] },

  techno: { type: String, default: "" },
  // attendancePercentage: { type: Number, min: 0, max: 100, default: 0 },

  // 🧑‍💼 Placement
  placedInfo: { type: placedInfoSchema, default: null },

  // 🗓️ Interviews
  interviewRecord: { type: [interviewRecordSchema], default: [] },

  // Permission
  permissionDetails: { type: permissionSchema, default: null },

  // 🚦 Status
  readinessStatus: {
    type: String,
    enum: ['Ready', 'Not Ready'],
    default: 'Not Ready'
  }

}, { timestamps: true });

module.exports = mongoose.model("AdmittedStudent", AdmittedStudentSchema);

