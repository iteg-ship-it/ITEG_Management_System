const mongoose = require("mongoose");

const technologySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "SubLevel" },
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
  learnedAt: { type: Date, default: Date.now }
}, { _id: false });

const taskSummarySchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level", required: true },
  subLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "SubLevel", required: true },
  total: { type: Number, default: 0 },
  completed: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  inProgress: { type: Number, default: 0 }
}, { _id: false });

const studentProfileSchema = new mongoose.Schema({
  // Link to AdmittedStudent
  admittedStudentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdmittedStudent",
    required: true,
    unique: true
  },

  // Link to new Student model
  studentRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },

  // Personal Info (mirrored from AdmittedStudent for quick access)
  prkey: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String },
  studentMobile: { type: String },
  gender: { type: String },
  image: { type: String, default: "" },

  // Batch Year e.g. "2026-2029"
  batchYear: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/
  },

  course: { type: String, required: true },
  track: { type: String },

  // Department / SubDepartment / Session
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  subDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "SubDepartment" },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },

  isFTP: { type: Boolean, default: false },

  // Current Level & SubLevel
  currentLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "Level" },
  currentSubLevelId: { type: mongoose.Schema.Types.ObjectId, ref: "SubLevel" },

  // Task Summary per level-sublevel
  taskSummary: { type: [taskSummarySchema], default: [] },

  // Overall task counts (computed/cached)
  totalTasks: { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  pendingTasks: { type: Number, default: 0 },

  // Technologies learned
  technologiesLearned: { type: [technologySchema], default: [] },

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
  ]
}, { timestamps: true });

studentProfileSchema.index({ batchYear: 1 });
studentProfileSchema.index({ currentLevelId: 1, currentSubLevelId: 1 });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
