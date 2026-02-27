const mongoose = require("mongoose");

// ==================== TASK DEFINITION SCHEMA (EMBEDDED) ====================
// Ye embedded task structure hai jo:
// Topic ke andar bhi ho sakta hai
// SubTopic ke andar bhi ho sakta hai
// Ye abhi sirf syllabus ke andar temporary structure hai.
const taskDefinitionSchema = new mongoose.Schema({
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
  dueDate: Date
}, { _id: true });

// ==================== SUBTOPIC SCHEMA ====================
// SubTopic ke andar direct tasks attach ho sakte hain.
const subTopicSchema = new mongoose.Schema({
  subTopicName: { type: String, required: true },
  tasks: [taskDefinitionSchema]  // Tasks at subtopic level
}, { _id: true });

// ==================== TOPIC SCHEMA ====================
// Topic ke andar:
// Direct tasks ho sakte hain
// Ya subTopics ke andar tasks ho sakte hain
// Ye tumhari requirement ko fulfill karta hai:
// Task topic ke sath ya subtopic ke sath attach ho sakta hai
// Ye hierarchical flexibility deta hai.
const topicSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  tasks: [taskDefinitionSchema],  // Tasks at topic level
  subTopics: [subTopicSchema]
}, { _id: true });

// ==================== SUBJECT SCHEMA ====================
const subjectSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  topics: [topicSchema]
}, { _id: true });

// ==================== SYLLABUS VERSION SCHEMA ====================
// Ye main collection hai jo:
// Pure syllabus ka ek version store karta hai
// Saare subjects, topics, subtopics aur tasks ko embed karta hai
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
  subjects: [subjectSchema],
  
  // Status tracking
  status: {
    type: String,
    enum: ["draft", "approved", "active", "archived"],
    default: "draft"
  },
  
  // TaskMaster generation tracking
//   Jab syllabus approved ho:
// Embedded tasks ko read karo
// TaskMaster records generate karo
// Flag true kar do
// Isse:
// Duplicate generation prevent hota hai
// System ko pata hota hai ki tasks sync ho chuke hain
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

module.exports = mongoose.model("SyllabusVersion", syllabusVersionSchema);
