const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController = require("../modules/student/controllers/AdmittedStudentController");

const allowedRoles = ["superadmin", "faculty", "admin"];
// Register Student
// //Swagger
router.post("/admitted", studentController.createAdmittedStudent);
// Get All Students
router.get(
  "/getall",
  verifyToken,
  checkRole(allowedRoles),
  studentController.getAllStudents
);


router.post("/create_level/:id", verifyToken, checkRole(allowedRoles),studentController.createLevels);

// Get All Students With Permission
router.get("/permission_students", verifyToken, checkRole(allowedRoles), studentController.getAllPermissionStudents
);

// Update Student Permission
router.put("/update_permission_student/:studentId", verifyToken, checkRole(allowedRoles), studentController.updatePermissionStudent);

// Get Single Student by ID
router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);

router.get("/get_levels/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentLevels);

router.put("/update-placement/:id", verifyToken, checkRole(allowedRoles), studentController.updatePlacementInfo);




// router.patch("/update/:id", verifyToken, checkRole(allowedRoles), studentController.updateStudent);
 router.get("/level/:levelNo", verifyToken, checkRole(allowedRoles),studentController.getLevelWiseStudents );

// router.get("/total/student/:levelNo", verifyToken, checkRole(allowedRoles),studentController. getStudentCountBySpecificLevel );


module.exports = router;
