const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController = require("../modules/student/controllers/AdmittedStudentController");
const placementController = require("../modules/student/controllers/placementController");

const upload = require('backend/config/multerConfig');

const allowedRoles = ["superadmin", "faculty", "admin"];

router.post("/admitted", studentController.createAdmittedStudent);
// Get All Students
router.get(
  "/getall",
  verifyToken,
  checkRole(allowedRoles),
  studentController.getAllStudents
);

router.get(
  "/get_student_by_level/:levelNo",
  verifyToken,
  checkRole(allowedRoles),
  studentController.getAllStudentsByLevel
);

router.get("/Ready_Students", verifyToken, checkRole(allowedRoles), studentController.getReadyStudent);

router.post("/create_level/:id", verifyToken, checkRole(allowedRoles), studentController.createLevels);


router.get("/permission_students", verifyToken, checkRole(allowedRoles), studentController.getAllPermissionStudents
);

router.patch("/update_permission_student/:studentId", verifyToken, checkRole(allowedRoles), studentController.updatePermissionStudent);

// Placement Routes (before /:id route)
router.post('/placement-post', verifyToken, checkRole(allowedRoles), placementController.createPlacementPost);
router.get('/companies', verifyToken, checkRole(allowedRoles), placementController.getAllCompanies);
router.get('/companies/:companyName', verifyToken, checkRole(allowedRoles), placementController.getCompanyByName);
router.post('/placement-documents', verifyToken, checkRole(allowedRoles), placementController.uploadPlacementDocuments);
router.get('/placement-documents/:studentId', verifyToken, checkRole(allowedRoles), placementController.getPlacementDocuments);

router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);

router.get("/get_levels/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentLevels);

router.patch("/update-placement/:id", verifyToken, checkRole(allowedRoles), studentController.updatePlacementInfo);

router.get("/level/:levelNo", verifyToken, checkRole(allowedRoles), studentController.getLevelWiseStudents);

router.post('/interviews/:studentId', studentController.addInterviewRecord );

router.patch('/update/interviews/:studentId/:interviewId', studentController.updateInterviewRecord);


router.post('/upload_Resume_Base64', studentController.uploadResumeBase64);

router.post('/generate', studentController.generatePlacementPost);

router.patch('/update_technology/:id', studentController.updateTechnology);

router.patch('/update/profile/:id', studentController.updateStudentProfile);

router.patch("/reschedule/interview/:studentId/:interviewId/", studentController.rescheduleInterview);

// router.get('/count/:studentId', studentController.countStudentInterviews);


module.exports = router;
