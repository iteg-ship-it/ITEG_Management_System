const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  syllabusVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SyllabusVersion",
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  subjectName: { type: String, default: "" },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  topicName: { type: String, default: "" },
  subTopicId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  subTopicName: { type: String, default: "" },
  taskNodeType: {
    type: String,
    enum: ["topic", "subTopic"],
    required: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  type: {
    type: String,
    enum: ["assignment", "project", "practice", "reading", "assessment", "other"],
    default: "assignment"
  },
  mandatory: { type: Boolean, default: true },
  maxMarks: { type: Number, min: 0, default: 5 },
  order: { type: Number, default: 1 },
  timeDays: { type: Number, default: null },
  measurablePoints: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

taskSchema.index({ syllabusVersionId: 1, subjectId: 1, topicId: 1 });
taskSchema.index({ syllabusVersionId: 1, subTopicId: 1 });
taskSchema.index({ syllabusVersionId: 1, isActive: 1 });

module.exports = mongoose.model("Task", taskSchema);
