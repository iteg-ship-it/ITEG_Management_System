
const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController= require("../modules/student/controllers/AdmittedStudentController");

const allowedRoles = ["Super Admin", "Faculty", "Admin"];
// Register Student

router.post("/admitted", verifyToken, checkRole(allowedRoles), studentController.createStudent);


// // Get All Students
router.get("/getall", verifyToken, checkRole(allowedRoles), studentController.getAllStudents);

// // Get Single Student by ID
router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);


// // Update Student Data
router.put("/update/:id", verifyToken, checkRole(allowedRoles), studentController.updateStudent);

// // Delete Student
router.delete("/:id", verifyToken, checkRole(allowedRoles), studentController.deleteStudent);


// // Faculty, Admin, & Super Admin Can Migrate Data
// // router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), studentController.migrateStudents);

router.post("/create/interviews/:id", verifyToken,  checkRole(allowedRoles),studentController. addInterviewRecord);

router.get("/interviews/:id", verifyToken, checkRole(allowedRoles),studentController. getStudentInterview );

// Update Interview Record
router.put("/up/interviews/:id", verifyToken, checkRole(allowedRoles),studentController. updateInterviewResult);
// // // Add Interview Record

// // router.put("/:interviewId",studentController. updateInterview);
router.post("/create/level/:id", verifyToken, checkRole(allowedRoles),studentController. createLevel);

router.get("/student/level/:levelNo", verifyToken, checkRole(allowedRoles),studentController. getStudentsByLevel );

router.get("/total/student/:levelNo", verifyToken, checkRole(allowedRoles),studentController. getStudentCountBySpecificLevel );
module.exports = router;
