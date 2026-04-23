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

const taskSnapshotSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    required: true
  },
  marks: {
    type: Number,
    min: 0,
    default: null
  },
  maxMarks: {
    type: Number,
    min: 0,
    default: 5
  },
  notes: {
    type: String,
    default: ""
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  changedByName: {
    type: String,
    default: ""
  },
  changedByRole: {
    type: String,
    default: ""
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const milestoneEventSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["promotion", "email", "document", "task", "note"],
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  createdByName: {
    type: String,
    default: ""
  },
  createdByRole: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const promotionHistorySchema = new mongoose.Schema({
  fromLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true
  },
  fromSubLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubLevel",
    required: true
  },
  toLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true
  },
  toSubLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubLevel",
    required: true
  },
  promotedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  promotedByName: {
    type: String,
    default: ""
  },
  promotedByRole: {
    type: String,
    default: ""
  },
  remark: {
    type: String,
    default: ""
  },
  promotedAt: {
    type: Date,
    default: Date.now
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

  taskSnapshots: {
    type: [taskSnapshotSchema],
    default: []
  },

  promotionHistory: {
    type: [promotionHistorySchema],
    default: []
  },

  eventHistory: {
    type: [milestoneEventSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
