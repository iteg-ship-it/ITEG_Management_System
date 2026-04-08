const mongoose = require("mongoose");

const syllabusVersionSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true, index: true },
  levelId:   { type: mongoose.Schema.Types.ObjectId, ref: "Level",   required: true, index: true },
  subLevelId:{ type: mongoose.Schema.Types.ObjectId, ref: "SubLevel",required: true, index: true },

  // Subject name stored directly — one SyllabusVersion = one Subject
  subjectName: { type: String, required: true, trim: true },

  version: { type: String, required: true },

  subjectIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject"  }],
  topicIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic"    }],
  subTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubTopic" }],

  status: {
    type: String,
    enum: ["draft", "approved", "active", "archived"],
    default: "draft"
  },

  taskMasterGenerated:   { type: Boolean, default: false },
  taskMasterGeneratedAt: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Unique: one version per session + subLevel + subject + version name
syllabusVersionSchema.index(
  { sessionId: 1, subLevelId: 1, subjectName: 1, version: 1 },
  { unique: true }
);
syllabusVersionSchema.index({ subLevelId: 1, subjectName: 1, status: 1 });
syllabusVersionSchema.index({ status: 1 });
syllabusVersionSchema.index({ isActive: 1 });

module.exports = mongoose.model("SyllabusVersion", syllabusVersionSchema);
