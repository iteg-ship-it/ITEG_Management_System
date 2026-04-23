const mongoose = require("mongoose");

// ==================== TASK MASTER SCHEMA ====================
// Centralized repository - Single source of truth
const taskMasterSchema = new mongoose.Schema({
  // Ye batata hai ki ye task kis syllabus version ka part hai
  syllabusVersionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SyllabusVersion", 
    required: true,
    index: true
  },
  // Task location in syllabus hierarchy
  // Task topic ke sath ya subtopic ke sath attach ho sakta hai.
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject", 
    required: true, 
    index: true 
  },
  topicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Topic", 
    required: true, 
    index: true 
  },
  subTopicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubTopic", 
    required: true, 
    index: true 
  },
  // Task definition (master copy)
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ["writtenExam", "interview", "project", "presentation", "learning", "assessment"],
    required: true
  },
  maxMarks: { type: Number, required: true },
  cutoff: { type: Number, required: true },
  mandatory: { type: Boolean, default: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueDate: Date,
  
  // Reference to original embedded task
//   Ye reference karta hai:
// Embedded task jo SyllabusVersion ke andar stored tha
// Matlab:
// SyllabusVersion → Topics → Subtopics → Embedded Task
// TaskMaster → us embedded task ka centralized copy
  originalTaskId: { type: mongoose.Schema.Types.ObjectId, required: true },
  
  // Status
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ==================== INDEXES ====================
taskMasterSchema.index({ syllabusVersionId: 1, isActive: 1 });
taskMasterSchema.index({ originalTaskId: 1 });
taskMasterSchema.index({ subjectId: 1, topicId: 1, subTopicId: 1 });
taskMasterSchema.index({ topicId: 1, isActive: 1 });
taskMasterSchema.index({ subTopicId: 1, isActive: 1 });

module.exports = mongoose.model("TaskMaster", taskMasterSchema);