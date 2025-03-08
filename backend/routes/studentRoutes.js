// // const express = require("express");
// // const router = express.Router();
// // const Student = require("../models/Student.js");
// // const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
// // const { migrateStudents } = require("../controllers/studentController");

// // // Register Student
// // router.post("/register", async (req, res) => {
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
// // });

// // // Get All Students
// // router.get("/", async (req, res) => {
// //     try {
// //         const students = await Student.find();
// //         res.status(200).json(students);
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // });

// // // Get Single Student by ID
// // router.get("/:id", async (req, res) => {
// //     try {
// //         const student = await Student.findById(req.params.id);
// //         if (!student) return res.status(404).json({ message: "Student not found" });
// //         res.status(200).json(student);
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // });

// // // Update Student Data
// // router.put("/:id", async (req, res) => {
// //     try {
// //         const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
// //         if (!updatedStudent) return res.status(404).json({ message: "Student not found" });
// //         res.status(200).json({ message: "Student updated successfully", student: updatedStudent });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // });

// // // Delete Student
// // router.delete("/:id", async (req, res) => {
// //     try {
// //         const deletedStudent = await Student.findByIdAndDelete(req.params.id);
// //         if (!deletedStudent) return res.status(404).json({ message: "Student not found" });
// //         res.status(200).json({ message: "Student deleted successfully" });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // });

// // //Faculty, Admin, & Super Admin Can Migrate Data
// // router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), migrateStudents);

// // module.exports = router;





// const express = require("express");
// const router = express.Router();
// const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
// const { migrateStudents } = require("../controllers/studentController");

// const {
//     registerStudent,
//     getAllStudents,
//     getStudentById,
//     updateStudent,
//     deleteStudent,
//     migrateStudents
// } = require("../controllers/studentController");

// // Register Student
// router.post("/register", registerStudent);

// // Get All Students
// router.get("/", getAllStudents);

// // Get Single Student by ID
// router.get("/:id", getStudentById);

// // Update Student Data
// router.put("/:id", updateStudent);

// // Delete Student
// router.delete("/:id", deleteStudent);

// // Faculty, Admin, & Super Admin Can Migrate Data
// router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), migrateStudents);

// module.exports = router;



const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController= require("../controllers/studentController");

// Register Student
router.post("/register", studentController.registerStudent);

// Get All Students
router.get("/", studentController.getAllStudents);

// Get Single Student by ID
router.get("/:id", studentController.getStudentById);

// Update Student Data
router.put("/:id", studentController.updateStudent);

// Delete Student
router.delete("/:id", studentController.deleteStudent);

// Faculty, Admin, & Super Admin Can Migrate Data
router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), studentController.migrateStudents);

module.exports = router;
