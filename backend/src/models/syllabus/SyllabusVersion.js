const mongoose = require("mongoose");


const taskSchema = new mongoose.Schema({
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
  isActive: { type: Boolean, default: true }
}, { _id: true });


const subTopicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  tasks: { type: [taskSchema], default: [] }
}, { _id: true });


const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  tasks: { type: [taskSchema], default: [] },
  subTopics: { type: [subTopicSchema], default: [] }
}, { _id: true });


const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, default: "" },
  description: { type: String, default: "" },
  order: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  topics: { type: [topicSchema], default: [] }
}, { _id: true });


const syllabusVersionSchema = new mongoose.Schema({
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
  version: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    default: "",
    trim: true
  },
  status: {
    type: String,
    enum: ["draft", "active", "archived"],
    default: "draft"
  },
  subjects: {
    type: [subjectSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });


syllabusVersionSchema.index(
  { sessionId: 1, levelId: 1, subLevelId: 1, version: 1 },
  { unique: true }
);


module.exports = mongoose.model("SyllabusVersion", syllabusVersionSchema);



