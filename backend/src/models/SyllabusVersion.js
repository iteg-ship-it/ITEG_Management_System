const mongoose = require("mongoose");

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

  version: { type: String, required: true },

  subjects: [
    {
      subjectName: { type: String, required: true },
      topics: [
        {
          topicName: { type: String, required: true },
          subTopics: [
            {
              subTopicName: { type: String, required: true }
            }
          ]
        }
      ]
    }
  ]
}, { timestamps: true });

// Ensure unique syllabus version per session-level-sublevel
syllabusVersionSchema.index(
  { sessionId: 1, levelId: 1, subLevelId: 1, version: 1 },
  { unique: true }
);

module.exports = mongoose.model("SyllabusVersion", syllabusVersionSchema);