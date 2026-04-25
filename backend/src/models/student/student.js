const mongoose = require("mongoose");

const studentDocumentSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["resume", "profileImage", "extra", "milestone", "placement"],
    default: "extra"
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    default: "",
    trim: true
  },
  mimeType: {
    type: String,
    default: "",
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  publicId: {
    type: String,
    default: "",
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  uploadedByName: {
    type: String,
    default: ""
  },
  uploadedByRole: {
    type: String,
    default: ""
  },
  remark: {
    type: String,
    default: ""
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });



const studentSchema = new mongoose.Schema({
  prkey: { type: String, required: true, unique: true },

  firstName: String,
  lastName: String,
  fatherName: String,
  email: String,
  studentMobile: String,
  parentMobile: String,
  image: { type: String, default: "" },
  gender: { type: String, default: "" },
  dob: { type: Date, default: null },
  aadharCard: { type: String, default: "" },
  address: { type: String, default: "" },
  village: { type: String, default: "" },
  category: { type: String, default: "" },
  stream: { type: String, default: "" },
  subject12: { type: String, default: "" },
  year12: { type: String, default: "" },
  percent12: { type: Number, default: null },
  percent10: { type: Number, default: null },

  subDepartmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubDepartment", 
    required: true 
  },
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Session", 
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

  syllabusVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SyllabusVersion",
    default: null
  },

  selectedCourse: { type: String, required: true },
  techno: { type: String, default: "" },
  profileRemark: { type: String, default: "" },

  isFTP: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["Active", "Completed", "Dropped", "Placed"],
    default: "Active"
  },

  readinessStatus: {
    type: String,
    enum: ["NotReady", "ReadyForPlacement"],
    default: "NotReady"
  },

  readyForPlacementAt: {
    type: Date,
    default: null
  },

  academicHistory: [
    {
      yearName: String,
      percentage: Number,
      result: { type: String, enum: ["Pass", "Fail"] },
      updatedAt: { type: Date, default: Date.now }
    }
  ],

  documents: {
    type: [studentDocumentSchema],
    default: []
  },

  profileImageDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  resumeDocumentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  promotionHistory: {
    type: [promotionHistorySchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
