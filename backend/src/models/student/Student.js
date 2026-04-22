const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  prkey: { type: String, required: true, unique: true },

  firstName: String,
  lastName: String,
  fatherName: String,
  email: String,
  studentMobile: String,
  parentMobile: String,

  subDepartmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubDepartment", 
    required: true 
  },
  sessionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Session", 
    required: true 
  },

  currentLevelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Level", 
    required: true 
  },
  currentSubLevelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubLevel", 
    required: true 
  },

  selectedCourse: { type: String, required: true },

  isFTP: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["Active", "Completed", "Dropped", "Placed"],
    default: "Active"
  },

  academicHistory: [
    {
      yearName: String,
      percentage: Number,
      result: { type: String, enum: ["Pass", "Fail"] },
      updatedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);