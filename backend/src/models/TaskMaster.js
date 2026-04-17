const mongoose = require("mongoose");

const taskMasterSchema = new mongoose.Schema({
  syllabusVersionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SyllabusVersion", 
    required: true,
    index: true
  },

  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Level",
    required: true,
    index: true
  },
  subLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubLevel",
    required: true,
    index: true
  },

  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
  subTopicId: { type: mongoose.Schema.Types.ObjectId, ref: "SubTopic", required: true },

  taskCode: { 
    type: String, 
    required: true,
    unique: true
  },

  title: { type: String, required: true },
  description: String,

  timeDays: { type: Number, default: null },
  measurablePoints: { type: String, default: null },

  type: {
    type: String,
    enum: ["writtenExam", "interview", "project", "presentation", "learning", "assessment"],
    default: "assessment"
  },

  maxMarks: { type: Number, default: 100 },
  cutoff: { type: Number, default: 40 },

  mandatory: { type: Boolean, default: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },

  dueDate: Date,

  originalTaskId: { type: mongoose.Schema.Types.ObjectId, default: null },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("TaskMaster", taskMasterSchema);