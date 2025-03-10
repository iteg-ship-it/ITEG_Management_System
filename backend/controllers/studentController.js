const { sqlPool } = require("../config/db");
const Student = require("../models/Student");

// Migrate Student Data from SQL to MongoDB
exports.migrateStudents = async (req, res) => {
    try {
        // Fetch Data from MySQL
        const [students] = await sqlPool.query("SELECT studentId, name, course, email FROM students");

        if (students.length === 0) {
            return res.status(404).json({ message: "No student data found in SQL database" });
        }

        // Insert Data into MongoDB
        await Student.insertMany(students);

        res.status(200).json({ message: "Student data migrated successfully!", migratedCount: students.length });
    } catch (error) {
        console.error("Error in migrating student data:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



//const Student = require("../models/Student");

//Dummy Data (SQL ke bina API test karne ke liye)
// const mockStudents = [
//     { studentId: "101", name: "John Doe", course: "BCA", email: "john@example.com" },
//     { studentId: "102", name: "Jane Smith", course: "MCA", email: "jane@example.com" },
//     { studentId: "103", name: "Anees Khan", course: "B.Tech", email: "anees@example.com" }
// ];

// // Migrate Students (Without SQL)
// exports.migrateStudents = async (req, res) => {
//     try {
//         const students = mockStudents; // SQL ke bina dummy data use karenge

//         // MongoDB me data insert karo
//         const savedStudents = await Student.insertMany(students);

//         res.status(201).json({ message: "Student data migrated successfully!", data: savedStudents });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error: error.message });
//     }
// };
async (req, res) => {
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
}


// const Student = require("../models/Student");

// const Student = require("../models/Student");

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

// Update Student Data
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

// Faculty, Admin, & Super Admin Can Migrate Data
exports.migrateStudents = async (req, res) => {
    try {
        // Migration logic yahan likho
        res.status(200).json({ message: "Student data migrated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
