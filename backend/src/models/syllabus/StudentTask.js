const mongoose = require("mongoose");

const studentTaskSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  syllabusVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SyllabusVersion",
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subTopicId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  subjectName: { type: String, required: true },
  topicName: { type: String, required: true },
  subTopicName: { type: String, default: null },
  taskNodeType: {
    type: String,
    enum: ["topic", "subTopic"],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, default: "assignment" },
  mandatory: { type: Boolean, default: true },
  maxMarks: { type: Number, max: 5, default: 0 },
  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    default: "pending"
  },
  marks: {
    type: Number,
    min: 0,
    default: null
  },
  notes: {
    type: String,
    default: ""
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

studentTaskSchema.index({ studentId: 1, taskId: 1 }, { unique: true });
studentTaskSchema.index({ studentId: 1, syllabusVersionId: 1, status: 1 });

module.exports = mongoose.model("StudentTask", studentTaskSchema);
