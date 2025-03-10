const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    interviewLevel: { type: String, required: true }, // Student Profile se fetch hoga
    date: { type: Date, required: true },
    remarks: { type: String },
    result: { type: String, enum: ["Pass", "Fail"], required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", interviewSchema);
