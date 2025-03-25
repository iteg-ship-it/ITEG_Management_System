const Student = require("../models/AdmittedStudents");

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update student by ID
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error while updating student" });
    }
};


// // Delete Student
// exports.deleteStudent = async (req, res) => {
//     try {
//         const deletedStudent = await Student.findByIdAndDelete(req.params.id);
//         if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
//         res.status(200).json({ message: "Student deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // Migrate Students
// exports.migrateStudents = async (req, res) => {
//     try {
//         // Migration logic here
//         res.status(200).json({ message: "Students migrated successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // // Migrate Student Data from SQL to MongoDB
// // exports.migrateStudents = async (req, res) => {
// //     try {
// //         // Fetch Data from MySQL
// //         const [students] = await sqlPool.query("SELECT studentId, name, course, email FROM students");

// //         if (students.length === 0) {
// //             return res.status(404).json({ message: "No student data found in SQL database" });
// //         }

// //         // Insert Data into MongoDB
// //         await Student.insertMany(students);

// //         res.status(200).json({ message: "Student data migrated successfully!", migratedCount: students.length });
// //     } catch (error) {
// //         console.error("Error in migrating student data:", error);
// //         res.status(500).json({ message: "Server Error", error: error.message });
// //     }
// // };



// //const Student = require("../models/Student");



// // // Migrate Students (Without SQL)
// // exports.migrateStudents = async (req, res) => {
// //     try {
// //         const students = mockStudents; // SQL ke bina dummy data use karenge

// //         // MongoDB me data insert karo
// //         const savedStudents = await Student.insertMany(students);

// //         res.status(201).json({ message: "Student data migrated successfully!", data: savedStudents });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error: error.message });
// //     }
// // };
// async (req, res) => {
//     try {
//         const { name, email, course, age } = req.body;
//         if (!name || !email || !course || !age) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
        
//         const newStudent = new Student({ name, email, course, age });
//         await newStudent.save();
//         res.status(201).json({ message: "Student registered successfully", student: newStudent });

//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// }


// // const Student = require("../models/Student");

// // const Student = require("../models/Student");

// // // Register Student
// // exports.registerStudent = async (req, res) => {
// //     try {
// //         const { name, email, course, age } = req.body;
// //         if (!name || !email || !course || !age) {
// //             return res.status(400).json({ message: "All fields are required" });
// //         }
        
// //         const newStudent = new Student({ name, email, course, age });
// //         await newStudent.save();
// //         res.status(201).json({ message: "Student registered successfully", student: newStudent });

// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };
 

// // // Get All Students
// // exports.getAllStudents = async (req, res) => {
// //     try {
// //         const students = await Student.find();
// //         res.status(200).json(students);
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };

// // // Get Single Student by ID
// // exports.getStudentById = async (req, res) => {
// //     try {
// //         const student = await Student.findById(req.params.id);
// //         if (!student) return res.status(404).json({ message: "Student not found" });
// //         res.status(200).json(student);
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };

// // // Update Student Data
// // exports.updateStudent = async (req, res) => {
// //     try {
// //         const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //         if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
// //         res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };

// // // Delete Student
// // exports.deleteStudent = async (req, res) => {
// //     try {
// //         const deletedStudent = await Student.findByIdAndDelete(req.params.id);
// //         if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
// //         res.status(200).json({ message: "Student deleted successfully" });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };

// // // Faculty, Admin, & Super Admin Can Migrate Data
// // exports.migrateStudents = async (req, res) => {
// //     try {
// //         // Migration logic yahan likho
// //         res.status(200).json({ message: "Student data migrated successfully" });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };


// // // Fetch All Interviews or by Query Params
// // exports.getInterviews = async (req, res) => {
// //     try {
// //         const { studentId, interviewLevel, result } = req.query;
// //         let query = {};

// //         if (studentId) query.studentId = studentId;
// //         if (interviewLevel) query.interviewLevel = interviewLevel;
// //         if (result) query.result = result;

// //         const interviews = await Interview.find(query).populate("studentId", "name email");
// //         res.status(200).json({ success: true, interviews });
// //     } catch (error) {
// //         console.error("Error fetching interviews:", error);
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };

// // // Add New Interview Record
// // exports.addInterview = async (req, res) => {
// //     try {
// //         const { studentId, date, remarks, result } = req.body;

// //         const student = await Student.findById(studentId);
// //         if (!student) {
// //             return res.status(404).json({ message: "Student not found" });
// //         }

// //         // Student Profile se Interview Level fetch karna
// //         const interviewLevel = student.course || "General";

// //         const newInterview = new Interview({
// //             studentId,
// //             interviewLevel,
// //             date,
// //             remarks,
// //             result
// //         });

// //         await newInterview.save();
// //         res.status(201).json({ success: true, message: "Interview record added", interview: newInterview });
// //     } catch (error) {
// //         console.error("Error adding interview record:", error);
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };

// // // Update Interview Record
// // exports.updateInterview = async (req, res) => {
// //     try {
// //         const { interviewId } = req.params;
// //         const { date, remarks, result } = req.body;

// //         const updatedInterview = await Interview.findByIdAndUpdate(
// //             interviewId,
// //             { date, remarks, result },
// //             { new: true }
// //         );

// //         if (!updatedInterview) {
// //             return res.status(404).json({ message: "Interview record not found" });
// //         }

// //         res.status(200).json({ success: true, message: "Interview updated", interview: updatedInterview });
// //     } catch (error) {
// //         console.error("Error updating interview:", error);
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };


// // Fetch Levels - No Authentication Required
// exports.getLevels = async (req, res) => {
//     try {
//         const { studentId, levelName, className } = req.query;
//         let query = {};

//         if (studentId) query.studentId = studentId;
//         if (levelName) query.levelName = levelName;
//         if (className) query.className = className;

//         const levels = await Level.find(query).populate("studentId", "name email");
//         res.status(200).json({ success: true, levels });
//     } catch (error) {
//         console.error("Error fetching levels:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // Add New Level Information - No Authentication Required
// exports.addLevel = async (req, res) => {
//     try {
//         const { studentId, levelName, className, marks, remarks, date } = req.body;

//         const student = await Student.findById(studentId);
//         if (!student) {
//             return res.status(404).json({ message: "Student not found" });
//         }

//         const newLevel = new Level({
//             studentId,
//             levelName,
//             className,
//             marks,
//             remarks,
//             date
//         });

//         await newLevel.save();
//         res.status(201).json({ success: true, message: "Level information added", level: newLevel });
//     } catch (error) {
//         console.error("Error adding level information:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // Update Level Information - No Authentication Required
// exports.updateLevel = async (req, res) => {
//     try {
//         const { levelId } = req.params;
//         const { levelName, className, marks, remarks, date } = req.body;

//         const updatedLevel = await Level.findByIdAndUpdate(
//             levelId,
//             { levelName, className, marks, remarks, date, updatedAt: Date.now() },
//             { new: true }
//         );

//         if (!updatedLevel) {
//             return res.status(404).json({ message: "Level information not found" });
//         }

//         res.status(200).json({ success: true, message: "Level updated", level: updatedLevel });
//     } catch (error) {
//         console.error("Error updating level information:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // Function to generate a certificate (Mock function)
// const generateCertificate = (studentName, levelName) => {
//     return `https://certificates.example.com/${studentName}_${levelName}_certificate.pdf`; // Fake URL
// };

// // Add Level Information - No Authentication Required
// exports.addLevel = async (req, res) => {
//     try {
//         const { studentId, levelName, className, marks, remarks, date, result } = req.body;

//         const student = await Student.findById(studentId);
//         if (!student) {
//             return res.status(404).json({ message: "Student not found" });
//         }

//         let certificateUrl = null;
//         let message = "";

//         // If student clears Level 1C, generate a certificate or failure message
//         if (levelName === "1C") {
//             if (result === "Pass") {
//                 certificateUrl = generateCertificate(student.name, levelName);
//                 message = "Congratulations! Your certificate has been generated.";
//             } else {
//                 message = "You should try again.";
//             }
//         }

//         const newLevel = new Level({
//             studentId,
//             levelName,
//             className,
//             marks,
//             remarks,
//             date,
//             result,
//             certificateUrl
//         });

//         await newLevel.save();
//         res.status(201).json({ success: true, message, level: newLevel });
//     } catch (error) {
//         console.error("Error adding level information:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // Update Level Information - No Authentication Required
// exports.updateLevel = async (req, res) => {
//     try {
//         const { levelId } = req.params;
//         const { levelName, className, marks, remarks, date, result } = req.body;

//         let certificateUrl = null;
//         let message = "";

//         if (levelName === "1C") {
//             if (result === "Pass") {
//                 const level = await Level.findById(levelId).populate("studentId", "name");
//                 certificateUrl = generateCertificate(level.studentId.name, levelName);
//                 message = "Congratulations! Your certificate has been generated.";
//             } else {
//                 message = "You should try again.";
//             }
//         }

//         const updatedLevel = await Level.findByIdAndUpdate(
//             levelId,
//             { levelName, className, marks, remarks, date, result, certificateUrl, updatedAt: Date.now() },
//             { new: true }
//         );

//         if (!updatedLevel) {
//             return res.status(404).json({ message: "Level information not found" });
//         }

//         res.status(200).json({ success: true, message, level: updatedLevel });
//     } catch (error) {
//         console.error("Error updating level information:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };
