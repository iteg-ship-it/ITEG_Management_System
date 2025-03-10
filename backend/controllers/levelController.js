const Level = require("../models/level");
const Student = require("../models/Student");

// Fetch Levels - No Authentication Required
exports.getLevels = async (req, res) => {
    try {
        const { studentId, levelName, className } = req.query;
        let query = {};

        if (studentId) query.studentId = studentId;
        if (levelName) query.levelName = levelName;
        if (className) query.className = className;

        const levels = await Level.find(query).populate("studentId", "name email");
        res.status(200).json({ success: true, levels });
    } catch (error) {
        console.error("Error fetching levels:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Add New Level Information - No Authentication Required
exports.addLevel = async (req, res) => {
    try {
        const { studentId, levelName, className, marks, remarks, date } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const newLevel = new Level({
            studentId,
            levelName,
            className,
            marks,
            remarks,
            date
        });

        await newLevel.save();
        res.status(201).json({ success: true, message: "Level information added", level: newLevel });
    } catch (error) {
        console.error("Error adding level information:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Update Level Information - No Authentication Required
exports.updateLevel = async (req, res) => {
    try {
        const { levelId } = req.params;
        const { levelName, className, marks, remarks, date } = req.body;

        const updatedLevel = await Level.findByIdAndUpdate(
            levelId,
            { levelName, className, marks, remarks, date, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedLevel) {
            return res.status(404).json({ message: "Level information not found" });
        }

        res.status(200).json({ success: true, message: "Level updated", level: updatedLevel });
    } catch (error) {
        console.error("Error updating level information:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Function to generate a certificate (Mock function)
const generateCertificate = (studentName, levelName) => {
    return `https://certificates.example.com/${studentName}_${levelName}_certificate.pdf`; // Fake URL
};

// Add Level Information - No Authentication Required
exports.addLevel = async (req, res) => {
    try {
        const { studentId, levelName, className, marks, remarks, date, result } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        let certificateUrl = null;
        let message = "";

        // If student clears Level 1C, generate a certificate or failure message
        if (levelName === "1C") {
            if (result === "Pass") {
                certificateUrl = generateCertificate(student.name, levelName);
                message = "Congratulations! Your certificate has been generated.";
            } else {
                message = "You should try again.";
            }
        }

        const newLevel = new Level({
            studentId,
            levelName,
            className,
            marks,
            remarks,
            date,
            result,
            certificateUrl
        });

        await newLevel.save();
        res.status(201).json({ success: true, message, level: newLevel });
    } catch (error) {
        console.error("Error adding level information:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

// Update Level Information - No Authentication Required
exports.updateLevel = async (req, res) => {
    try {
        const { levelId } = req.params;
        const { levelName, className, marks, remarks, date, result } = req.body;

        let certificateUrl = null;
        let message = "";

        if (levelName === "1C") {
            if (result === "Pass") {
                const level = await Level.findById(levelId).populate("studentId", "name");
                certificateUrl = generateCertificate(level.studentId.name, levelName);
                message = "Congratulations! Your certificate has been generated.";
            } else {
                message = "You should try again.";
            }
        }

        const updatedLevel = await Level.findByIdAndUpdate(
            levelId,
            { levelName, className, marks, remarks, date, result, certificateUrl, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedLevel) {
            return res.status(404).json({ message: "Level information not found" });
        }

        res.status(200).json({ success: true, message, level: updatedLevel });
    } catch (error) {
        console.error("Error updating level information:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};
