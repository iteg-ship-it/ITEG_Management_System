const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  // 🔑 Reference
  admissionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentAdmissionProcess",
    required: true,
    unique: true
  },
  prkey: { type: String, required: true, unique: true },

  // 👤 Personal Details
  image: { type: String, default: "" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String },
  studentMobile: { type: String, required: true },
  parentMobile: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date },
  aadharCard: { type: String, unique: true },
  address: { type: String, required: true },
  village: { type: String, required: true },

  // 📚 Academic Details
  course: { type: String, required: true },
  stream: { type: String },
  category: { type: String },
  track: { type: String },
  subject12: { type: String },
  year12: { type: String },
  percent12: { type: String },
  percent10: { type: String },
  year: { type: String, required: true, default: "first" },

  // 🏫 Department & Level
  subDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubDepartment",
    required: true
  },
  currentLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true
  },
  currentSubLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubLevel",
    required: true
  },
  currentLevel: { type: String, default: "1A" },

  // 🚌 Bus
  busRoute: { type: String, default: "" },

  // 🧑‍💻 Technology
  techno: { type: String, default: "" },
  isFTP: { type: Boolean, default: false },

  // 🚦 Status
  status: {
    type: String,
    enum: ["Active", "Completed", "Dropped", "Placed"],
    default: "Active"
  },
  readinessStatus: {
    type: String,
    enum: ["Ready", "Not Ready", "In Progress", "Ready for Interview"],
    default: "Not Ready"
  },

  // 📄 Documents
  resumeURL: { type: String, default: "" },
  offerLetter: { type: String, default: "" },
  commitmentApplication: { type: String, default: "" },
  documentsUploadedBy: { type: String, default: "" },
  documentsUploadedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
