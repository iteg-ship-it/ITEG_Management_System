
const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController= require("../modules/student/controllers/AdmittedStudentController");

const allowedRoles = ["Super Admin", "Faculty", "Admin"];
// Register Student

router.post("/admitted", verifyToken, checkRole(["Super Admin", "Admin"]), studentController.createStudent);


// // Get All Students
router.get("/getall", verifyToken, checkRole(allowedRoles), studentController.getAllStudents);

// // Get Single Student by ID
router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);


// // Update Student Data
router.put("/update/:id", verifyToken, checkRole(["Super Admin", "Admin"]), studentController.updateStudent);

// // Delete Student
// router.delete("/:id", studentController.deleteStudent);

// // Faculty, Admin, & Super Admin Can Migrate Data
// // router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), studentController.migrateStudents);


// // router.get("/",studentController. getInterviews);

// // // Add Interview Record
// // router.post("/", studentController.addInterview);

// // // Update Interview Record
// // router.put("/:interviewId",studentController. updateInterview);


module.exports = router;
