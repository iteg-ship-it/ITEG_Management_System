const Student = require("../models/Student.js");

// Register Student
exports.registerStudent = async (req, res) => {
    try {
        const { name, email, course, age } = req.body;
        if (!name || !email || !course || !age) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newStudent = new Student({ name, email, course, age });
        await newStudent.save();
        res.status(201).json({ message: "Student registered successfully", student: newStudent });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Get All Students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Get Single Student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Update Student
exports.updateStudent = async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
        res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Migrate Students
exports.migrateStudents = async (req, res) => {
    try {
        // Migration logic here
        res.status(200).json({ message: "Students migrated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
