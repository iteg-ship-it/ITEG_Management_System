const mongoose = require("mongoose");

const taskDefinitionSchema = new mongoose.Schema({
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

  // Optional syllabus references
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  topicId: { 
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  subTopicId: { 
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  // Task assignment - empty array = level-wide
  assignedStudentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  }],

  title: { type: String, required: true },
  description: String,
  
  type: {
    type: String,
    enum: ["writtenExam", "interview", "project", "presentation", "learning", "assessment"],
    required: true
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  maxMarks: { type: Number, required: true },
  cutoff: { type: Number, required: true },
  mandatory: { type: Boolean, default: true },

  dueDate: Date,
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for performance
taskDefinitionSchema.index({ sessionId: 1, levelId: 1, subLevelId: 1 });
taskDefinitionSchema.index({ assignedStudentIds: 1 });
taskDefinitionSchema.index({ mandatory: 1, isActive: 1 });

module.exports = mongoose.model("TaskDefinition", taskDefinitionSchema);