const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    levelName: { type: String, enum: ["Level 1A", "Level 1B", "Level 1C", "Level 2A", "Level 2B", "Level 2C"], required: true },
    className: { type: String, required: true },
    marks: { type: Number, required: true },
    remarks: { type: String },
    date: { type: Date, required: true },
    result: { type: String, enum: ["Pass", "Fail", "Pending"], default: null }, // Pending is for future use
    certificateUrl: { type: String, default: null }, // URL of the certificate
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Level", levelSchema);
