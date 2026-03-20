const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  universityName: { type: String, required: true },
  logo: { type: String, required: true },
  
  allowedCourses: [
    {
      courseName: { type: String, required: true },
      durationInYears: { type: Number, required: true }
    }
  ],

  reportConfig: {
    templateType: {
      type: String,
      enum: ["ITEG_STANDARD", "MEG_WEIGHTED", "BEG_CUTOFF", "BTECH_STAGE"],
      required: true
    },
    sections: {
      showTechnicalSkills: { type: Boolean, default: true },
      showSoftSkills: { type: Boolean, default: true },
      showDiscipline: { type: Boolean, default: true },
      showProjects: { type: Boolean, default: true },
      showCareerReadiness: { type: Boolean, default: true },
      showUniversityAcademicHistory: { type: Boolean, default: true },
      showTaskCompletionPercentage: { type: Boolean, default: true },
      showEvaluationBreakdown: { type: Boolean, default: true }
    }
  },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);