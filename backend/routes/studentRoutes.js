const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController = require("../modules/student/controllers/admittedStudentController");

const allowedRoles = ["superadmin", "faculty", "admin"];
// Register Student
// //Swagger
router.post("/admitted", studentController.createAdmittedStudent);

// // Get All Permission Students
// router.get("/permission-students", verifyToken, checkRole(['Super Admin', 'Admin', 'Faculty']), studentController.getAllPermissionStudents);

// // // Get All Students
router.get(
  "/getall",
  verifyToken,
  checkRole(allowedRoles),
  studentController.getAllStudents
);

// // // Get Single Student by ID
// router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);

// Create Permission Student API (Only authorized roles)
// router.post('/create-permission-student/:id', verifyToken, checkRole(['Super Admin', 'Admin', 'Faculty']), studentController.createPermissionStudent);

// // Update Permission Student API (Only authorized roles)
// router.put('/update-permission-student/:studentId', verifyToken, checkRole(['Super Admin', 'Admin', 'Faculty']), studentController.updatePermissionStudent);

// // // Update Student Data
// //Swagger
// router.patch("/update/:id", verifyToken, checkRole(allowedRoles), studentController.updateStudent);

// // // Delete Student
// router.delete("/:id", verifyToken, checkRole(allowedRoles), studentController.deleteStudent);
// //swagger
// router.post("/create/interviews/:id", verifyToken,  checkRole(allowedRoles),studentController. addInterviewRecord);

// router.get("/interviews/:id", verifyToken, checkRole(allowedRoles),studentController. getStudentInterview );
// //Swagger
// // Update Interview Record
// router.patch("/up/interviews/:id", verifyToken, checkRole(allowedRoles),studentController. updateInterviewResult);
// // // // Add Interview Record

// // // router.put("/:interviewId",studentController. updateInterview);
// // Swagger
// router.post("/create/level/:id", verifyToken, checkRole(allowedRoles),studentController. createLevel);

// router.get("/student/level/:levelNo", verifyToken, checkRole(allowedRoles),studentController. getStudentsByLevel );

// router.get("/total/student/:levelNo", verifyToken, checkRole(allowedRoles),studentController. getStudentCountBySpecificLevel );

// router.get("/getlevels/:id", verifyToken, checkRole(allowedRoles),studentController. getStudentLevels );

module.exports = router;
