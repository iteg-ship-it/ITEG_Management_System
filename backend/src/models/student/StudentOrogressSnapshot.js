const mongoose = require("mongoose");

const studentProgressSnapshotSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  snapshotScope: {
    type: String,
    enum: ["overall", "subject"],
    default: "overall"
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  sessionName: {
    type: String,
    default: ""
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true
  },
  levelName: {
    type: String,
    default: ""
  },
  subLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubLevel",
    required: true
  },
  subLevelName: {
    type: String,
    default: ""
  },
  syllabusVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SyllabusVersion",
    required: true
  },
  syllabusVersionTitle: {
    type: String,
    default: ""
  },
  syllabusVersionCode: {
    type: String,
    default: ""
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  subjectName: {
    type: String,
    default: ""
  },
  totalTasks: {
    type: Number,
    min: 0,
    required: true
  },
  completedTasks: {
    type: Number,
    min: 0,
    required: true
  },
  pendingTasks: {
    type: Number,
    min: 0,
    required: true
  },
  inProgressTasks: {
    type: Number,
    min: 0,
    default: 0
  },
  averageMarks: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
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
}, { timestamps: true });

studentProgressSnapshotSchema.index({ studentId: 1, changedAt: -1 });
studentProgressSnapshotSchema.index({ studentId: 1, snapshotScope: 1, subjectId: 1, changedAt: -1 });

module.exports = mongoose.model("StudentProgressSnapshot", studentProgressSnapshotSchema);
