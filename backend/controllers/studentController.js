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
