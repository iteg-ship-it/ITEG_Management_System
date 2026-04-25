const mongoose = require("mongoose");

const placedInfoSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },

  companyName: String,
  salary: Number,
  location: String,
  jobProfile: String,

  jobType: { 
    type: String, 
    enum: ["Internship", "Full-Time", "PPO"] 
  },

  joiningDate: Date,
  placedDate: { type: Date, default: Date.now },

  offerLetterURL: String
}, { timestamps: true });

module.exports = mongoose.model("PlacedInfo", placedInfoSchema);