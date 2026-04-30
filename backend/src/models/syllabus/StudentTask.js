const mongoose = require("mongoose");


const studentTaskSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true
  },
  subLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubLevel",
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
  maxMarks: { type: Number, min: 0, max: 5, default: 5 },
  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    default: "pending"
  },
  marks: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  notes: {
    type: String,
    default: ""
  },
  assignedType: {
    type: String,
    enum: ["auto", "manual"],
    default: "auto"
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  assignedByName: {
    type: String,
    default: ""
  },
  assignedByRole: {
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


studentTaskSchema.pre("validate", function validateMarks(next) {
  if (this.status === "completed" && (this.marks === null || this.marks === undefined)) {
    return next(new Error("Marks are required when task status is completed"));
  }


  if (this.status !== "completed") {
    this.marks = null;
  }


  if (this.marks !== null && this.marks !== undefined && this.marks > this.maxMarks) {
    return next(new Error("Marks cannot exceed maxMarks"));
  }


  next();
});


studentTaskSchema.index({ studentId: 1, taskId: 1 }, { unique: true });
studentTaskSchema.index({ studentId: 1, syllabusVersionId: 1, status: 1 });
studentTaskSchema.index({ studentId: 1, sessionId: 1, levelId: 1, subLevelId: 1, syllabusVersionId: 1 });


module.exports = mongoose.model("StudentTask", studentTaskSchema);