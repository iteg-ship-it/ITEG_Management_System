const mongoose = require("mongoose");

const studentTaskSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  taskDefinitionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TaskDefinition", 
    required: true 
  },

  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    default: "pending"
  },

  obtainedMarks: { 
    type: Number, 
    default: 0 
  },

  attempts: [{
    attemptNumber: { type: Number, required: true },
    marksObtained: { type: Number, required: true },
    submissionDate: { type: Date, default: Date.now },
    feedback: String,
    evaluatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }
  }],

  // Promotion freeze - locked tasks cannot be modified
  isLocked: { type: Boolean, default: false },

  completedAt: Date,
  submissionUrl: String,
  notes: String
}, { timestamps: true });

// Indexes for performance
studentTaskSchema.index({ studentId: 1, taskDefinitionId: 1 }, { unique: true });
studentTaskSchema.index({ studentId: 1, isLocked: 1 });
studentTaskSchema.index({ status: 1, isLocked: 1 });

module.exports = mongoose.model("StudentTask", studentTaskSchema);