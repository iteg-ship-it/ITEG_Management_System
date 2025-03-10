const Interview = require("../models/interview.js");
const Student = require("../models/Student");

// Fetch All Interviews or by Query Params
exports.getInterviews = async (req, res) => {
    try {
        const { studentId, interviewLevel, result } = req.query;
        let query = {};

        if (studentId) query.studentId = studentId;
        if (interviewLevel) query.interviewLevel = interviewLevel;
        if (result) query.result = result;

        const interviews = await Interview.find(query).populate("studentId", "name email");
        res.status(200).json({ success: true, interviews });
    } catch (error) {
        console.error("Error fetching interviews:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Add New Interview Record
exports.addInterview = async (req, res) => {
    try {
        const { studentId, date, remarks, result } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Student Profile se Interview Level fetch karna
        const interviewLevel = student.course || "General";

        const newInterview = new Interview({
            studentId,
            interviewLevel,
            date,
            remarks,
            result
        });

        await newInterview.save();
        res.status(201).json({ success: true, message: "Interview record added", interview: newInterview });
    } catch (error) {
        console.error("Error adding interview record:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Update Interview Record
exports.updateInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { date, remarks, result } = req.body;

        const updatedInterview = await Interview.findByIdAndUpdate(
            interviewId,
            { date, remarks, result },
            { new: true }
        );

        if (!updatedInterview) {
            return res.status(404).json({ message: "Interview record not found" });
        }

        res.status(200).json({ success: true, message: "Interview updated", interview: updatedInterview });
    } catch (error) {
        console.error("Error updating interview:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};
