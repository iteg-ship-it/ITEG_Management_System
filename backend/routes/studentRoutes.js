
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
router.put("/update/:id", verifyToken, checkRole(["Super Admin", "Admin","faculty"]), studentController.updateStudent);

// // Delete Student
router.delete("/:id", verifyToken, checkRole(["Super Admin","admin"]), studentController.deleteStudent);


// // Faculty, Admin, & Super Admin Can Migrate Data
// // router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), studentController.migrateStudents);

router.post("/create/interviews/:id", verifyToken,  checkRole(["Faculty", "Admin", "Super Admin"]),studentController. addInterviewRecord);

router.get("/interviews/:id", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]),studentController. getStudentInterview );

// Update Interview Record
router.put("/up/interviews/:id", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]),studentController. updateInterviewResult);
// // // Add Interview Record

// // router.put("/:interviewId",studentController. updateInterview);
router.post("/create/level/:id",studentController. updateInterviewResult);

module.exports = router;
