const mongoose = require("mongoose");

const taskMasterSchema = new mongoose.Schema({
  syllabusVersionId: { type: mongoose.Schema.Types.ObjectId, ref: "SyllabusVersion", required: true, index: true },
  levelId:   { type: mongoose.Schema.Types.ObjectId, ref: "Level",   index: true },
  subLevelId:{ type: mongoose.Schema.Types.ObjectId, ref: "SubLevel", index: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject",  required: true, index: true },
  topicId:   { type: mongoose.Schema.Types.ObjectId, ref: "Topic",    required: true, index: true },
  subTopicId:{ type: mongoose.Schema.Types.ObjectId, ref: "SubTopic", default: null,  index: true },
  taskCode:  { type: String, trim: true },
  title:     { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ["writtenExam", "interview", "project", "presentation", "learning", "assessment"],
    required: true
  },
  maxMarks:         { type: Number, required: true },
  cutoff:           { type: Number, required: true },
  mandatory:        { type: Boolean, default: true },
  priority:         { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueDate:          Date,
  timeDays:         { type: Number, default: null },
  measurablePoints: { type: String, default: null },
  originalTaskId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  isActive:         { type: Boolean, default: true }
}, { timestamps: true });

// ==================== INDEXES ====================
taskMasterSchema.index({ syllabusVersionId: 1, isActive: 1 });
taskMasterSchema.index({ originalTaskId: 1 });
taskMasterSchema.index({ subjectId: 1, topicId: 1, subTopicId: 1 });
taskMasterSchema.index({ topicId: 1, isActive: 1 });
taskMasterSchema.index({ subTopicId: 1, isActive: 1 });

module.exports = mongoose.model("TaskMaster", taskMasterSchema);