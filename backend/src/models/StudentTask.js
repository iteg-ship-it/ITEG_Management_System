const mongoose = require("mongoose");

// ==================== STUDENT TASK SCHEMA ====================
// Tasks assigned from TaskMaster with snapshot for historical integrity
const studentTaskSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true,
    index: true
  },
  taskMasterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TaskMaster", 
    required: true,
    index: true
  },
  syllabusVersionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SyllabusVersion", 
    required: true,
    index: true
  },

  // ==================== SNAPSHOT (COPIED FROM TASKMASTER) ====================
  // Preserved for historical integrity - won't change if TaskMaster updates
  snapshot: {
    subjectName: { type: String, required: true, index: true },
    topicName: { type: String, required: true },
    subTopicName: { type: String },
    taskTitle: { type: String, required: true },
    taskType: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    cutoff: { type: Number, required: true },
    mandatory: { type: Boolean, required: true },
    priority: String,
    dueDate: Date,
    assignedAt: { type: Date, default: Date.now }
  },

  // ==================== STUDENT PROGRESS ====================
  status: {
    type: String,
    enum: ["notStarted", "inProgress", "submitted", "completed", "failed"],
    default: "notStarted",
    index: true
  },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },

  // ==================== MARKS & EVALUATION ====================
  marksObtained: { type: Number, default: 0 },
  isPassed: { type: Boolean, default: false, index: true },

  // Dates
  startedAt: Date,
  submittedAt: Date,
  completedAt: Date,

  // ==================== SUBMISSION ====================
  submissionUrl: String,
  studentNotes: String,

  // ==================== EVALUATION ====================
  teacherFeedback: String,
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  evaluatedAt: Date,

  // Attempt history
  attempts: [{
    attemptNumber: { type: Number, required: true },
    marksObtained: { type: Number, required: true },
    submissionDate: { type: Date, default: Date.now },
    feedback: String,
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }],

  // ==================== PROMOTION LOCK ====================
  isLocked: { type: Boolean, default: false, index: true },
  lockedAt: Date,
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// ==================== INDEXES ====================
studentTaskSchema.index({ studentId: 1, taskMasterId: 1 }, { unique: true });
studentTaskSchema.index({ studentId: 1, syllabusVersionId: 1 });
studentTaskSchema.index({ studentId: 1, "snapshot.subjectName": 1 });
studentTaskSchema.index({ studentId: 1, status: 1 });
studentTaskSchema.index({ studentId: 1, syllabusVersionId: 1, "snapshot.mandatory": 1, isPassed: 1 });

module.exports = mongoose.model("StudentTask", studentTaskSchema);