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

// Placement Workflow Routes (before /:id route) - Keep original URLs
// 1. Interview Management
router.post('/interviews/:id', placementController.createInterview); // Keep original URL
router.patch('/update/interviews/:studentId/:interviewId', placementController.updateInterviewStatus);
router.post('/interviews/:studentId/:interviewId/add_round', verifyToken, checkRole(allowedRoles), placementController.addInterviewRound);

// 2. Student Lists
router.get('/selected_students', verifyToken, checkRole(allowedRoles), placementController.getSelectedStudents);
router.get('/Ready_Students', verifyToken, checkRole(allowedRoles), studentController.getReadyStudent); // Keep original
router.get('/placed_students', verifyToken, checkRole(allowedRoles), placementController.getPlacedStudents);

// 3. Placement Management
router.post('/confirm_placement', verifyToken, checkRole(allowedRoles), placementController.confirmPlacement);
router.patch('/update_job_type', verifyToken, checkRole(allowedRoles), placementController.updateJobType);
router.post('/placement_post', verifyToken, checkRole(allowedRoles), placementController.createPlacementPost);

// 4. Company & Document Management
router.get('/companies', verifyToken, checkRole(allowedRoles), placementController.getAllCompanies);
router.get('/companies/:companyName', verifyToken, checkRole(allowedRoles), placementController.getCompanyByName);
router.post('/placement_documents', verifyToken, checkRole(allowedRoles), placementController.uploadPlacementDocuments);
router.get('/placement_documents/:studentId', verifyToken, checkRole(allowedRoles), placementController.getPlacementDocuments);
router.get('/interview_history/:studentId', verifyToken, checkRole(allowedRoles), placementController.getStudentInterviewHistory);

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

router.get("/companies/placed_students/:companyId", placementController.getPlacedStudentsByCompany);



module.exports = router;
