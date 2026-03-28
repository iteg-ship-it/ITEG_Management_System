const mongoose = require("mongoose");

// ==================== SYLLABUS VERSION SCHEMA ====================
// Reference-based design - No embedded documents
const syllabusVersionSchema = new mongoose.Schema({
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Session", 
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
  version: { type: String, required: true },
  // Reference to subjects, topics, subtopics
  subjectIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Subject" 
  }],
  topicIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Topic" 
  }],
  subTopicIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubTopic" 
  }],
  
  // Status tracking
  status: {
    type: String,
    enum: ["draft", "approved", "active", "archived"],
    default: "draft"
  },
  
  // TaskMaster generation tracking
  taskMasterGenerated: { type: Boolean, default: false },
  taskMasterGeneratedAt: Date,
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ==================== INDEXES ====================
syllabusVersionSchema.index(
  { sessionId: 1, levelId: 1, subLevelId: 1, version: 1 },
  { unique: true }
);
syllabusVersionSchema.index({ status: 1 });
syllabusVersionSchema.index({ isActive: 1 });

module.exports = mongoose.model("SyllabusVersion", syllabusVersionSchema);
