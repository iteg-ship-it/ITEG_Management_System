const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  imageURL: { type: String, required: true },
  remark: { type: String, default: "" },
  uploadDate: { type: Date, default: Date.now },
  approved_by: {
    type: String,
    enum: ["super admin", "admin", "faculty"],
    required: true
  }
});

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileURL: { type: String, required: true },
  fileType: {
    type: String,
    enum: ["image", "pdf"],
    required: true
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  uploadedByName: { type: String, default: "" },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: true });

const studentSchema = new mongoose.Schema({
  // 🎓 Personal Details
  prkey: { type: String, required: true, unique: true },
  image: { type: String, default: "" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String },
  studentMobile: { type: String, required: true },
  parentMobile: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date },
  aadharCard: { type: String },
  address: { type: String, required: true },
  track: { type: String },
  village: { type: String, required: true },
  stream: { type: String },
  course: { type: String, required: true },
  category: { type: String },
  subject12: { type: String },
  year12: { type: String },
  percent12: { type: String },
  percent10: { type: String },

  // 🏢 Organizational Assignment
  subDepartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubDepartment",
    required: true
  },

  // 📅 Session & Syllabus Version (frozen at enrollment)
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  syllabusVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SyllabusVersion",
    required: true
  },

  // 📍 Current Position
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

  // 🚦 Status
  status: {
    type: String,
    enum: ["Active", "Completed", "Dropped", "Placed"],
    default: "Active"
  },
  isFTP: { type: Boolean, default: false },

  // 🔐 Permission
  permissionDetails: { type: permissionSchema, default: null },

  // 📁 Student Documents (images & PDFs)
  documents: { type: [documentSchema], default: [] },

  // 📚 Academic History
  academicHistory: [
    {
      yearName: String,
      percentage: Number,
      result: { type: String, enum: ["Pass", "Fail"] },
      updatedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

studentSchema.index({ prkey: 1 });
studentSchema.index({ sessionId: 1, subDepartmentId: 1 });
studentSchema.index({ currentSubLevelId: 1, syllabusVersionId: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model("Student", studentSchema);
