const mongoose = require("mongoose");

const studentPromotionSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },

  fromLevelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Level",
    required: true
  },
  fromSubLevelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubLevel",
    required: true
  },

  toLevelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Level",
    required: true
  },
  toSubLevelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "SubLevel",
    required: true
  },

  // Promotion validation summary
  mandatoryTasksCompleted: { type: Number, required: true },
  totalMandatoryTasks: { type: Number, required: true },
  
  promotionDate: { type: Date, default: Date.now },
  promotedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  remarks: String
}, { timestamps: true });

// Index for student promotion history
studentPromotionSchema.index({ studentId: 1, promotionDate: -1 });

module.exports = mongoose.model("StudentPromotion", studentPromotionSchema);