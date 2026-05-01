const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");


const studentController = require("../controllers/student/studentController");
const placementController = require("../controllers/placement/placementController");
const attendanceController = require("../controllers/student/attendanceController");
const upload = require("../config/multerConfig");


const allowedRoles = ["superadmin", "faculty", "admin"];


// =============================================================
// ── STUDENT BASIC CRUD  (mounted at /api/students)
// =============================================================


router.post("/", verifyToken, checkRole(allowedRoles), studentController.createStudent);
router.get("/", verifyToken, checkRole(allowedRoles), studentController.getAllStudents);
router.get("/stats", verifyToken, checkRole(allowedRoles), studentController.getStudentStats);


// ── Permission ──────────────────────────────────────────────
// must be before /:id
router.get("/permission/list", verifyToken, checkRole(allowedRoles), studentController.getPermissionStudents);


// ── Placement: Ready / Selected / Placed lists ───────────────
// must be before /:id
router.get("/Ready_Students", verifyToken, placementController.getReadyStudents);
router.get("/selected_students", verifyToken, checkRole(allowedRoles), placementController.getSelectedStudents);
router.get("/placed_students", verifyToken, checkRole(allowedRoles), placementController.getPlacedStudents);


// ── Placement: Interview Management ─────────────────────────
router.post("/interviews/:id", verifyToken, checkRole(allowedRoles), placementController.createInterview);
router.patch("/update/interviews/:studentId/:interviewId", verifyToken, checkRole(allowedRoles), placementController.updateInterviewStatus);
router.post("/interviews/:studentId/:interviewId/add_round", verifyToken, checkRole(allowedRoles), placementController.addInterviewRound);
router.patch("/reschedule/interview/:studentId/:interviewId", verifyToken, checkRole(allowedRoles), placementController.rescheduleInterview);
router.get("/interview_history/:studentId", verifyToken, checkRole(allowedRoles), placementController.getStudentInterviewHistory);


// ── Placement: Confirm & Manage ──────────────────────────────
router.post("/confirm_placement", verifyToken, checkRole(allowedRoles),
  upload.fields([{ name: "applicationFile", maxCount: 1 }, { name: "offerLetterFile", maxCount: 1 }]),
  placementController.confirmPlacement
);
router.patch("/update_job_type", verifyToken, checkRole(allowedRoles), placementController.updateJobType);
router.patch("/update-placement/:id", verifyToken, checkRole(allowedRoles), placementController.updatePlacementInfo);


// ── Placement: Post ──────────────────────────────────────────
router.post("/placement_post", verifyToken, checkRole(allowedRoles), placementController.createPlacementPost);
router.post("/placement_post/update/:studentId", verifyToken, checkRole(allowedRoles), placementController.updatePlacementPost);


// ── Placement: Documents & Resume ───────────────────────────
router.post("/placement_documents", verifyToken, checkRole(allowedRoles), placementController.uploadPlacementDocuments);
router.get("/placement_documents/:studentId", verifyToken, checkRole(allowedRoles), placementController.getPlacementDocuments);
router.post("/upload_Resume_Base64", verifyToken, checkRole(allowedRoles), placementController.uploadResumeBase64);


// ── Companies ────────────────────────────────────────────────
router.get("/companies", verifyToken, checkRole(allowedRoles), placementController.getAllCompanies);
router.get("/companies/placed_students/:companyId", verifyToken, checkRole(allowedRoles), placementController.getPlacedStudentsByCompany);
router.get("/companies/:companyName", verifyToken, checkRole(allowedRoles), placementController.getCompanyByName);


// ── Attendance ───────────────────────────────────────────────
router.get("/attendance/stats", verifyToken, checkRole(allowedRoles), attendanceController.getOverallAttendanceStats);


// =============================================================
// ── STUDENT BY ID  (keep /:id routes after all static routes)
// =============================================================


router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);
router.patch("/:id", verifyToken, checkRole(allowedRoles), studentController.updateStudent);


// ── Readiness & Promotion ────────────────────────────────────
router.patch("/:id/readiness-status", verifyToken, checkRole(allowedRoles), studentController.updateReadinessStatus);
router.post("/:id/promote", verifyToken, checkRole(allowedRoles), studentController.promoteStudent);


// ── Profile Image ────────────────────────────────────────────
router.patch("/:id/profile-image", verifyToken, checkRole(allowedRoles), studentController.updateProfileImage);


// ── Student Documents ────────────────────────────────────────
router.post("/:id/documents", verifyToken, checkRole(allowedRoles), studentController.uploadDocument);
router.delete("/:id/documents/:docId", verifyToken, checkRole(allowedRoles), studentController.deleteDocument);


// ── Permission ───────────────────────────────────────────────
router.patch("/:id/permission", verifyToken, checkRole(allowedRoles), studentController.updatePermission);


// ── Tasks ────────────────────────────────────────────────────
router.get("/:id/tasks", verifyToken, checkRole(allowedRoles), studentController.getStudentTasks);
router.get("/:id/tasks/sublevel/:subLevelId", verifyToken, checkRole(allowedRoles), studentController.getStudentTasksBySubLevel);


// ── History & Snapshots ──────────────────────────────────────
router.get("/:id/task-history", verifyToken, checkRole(allowedRoles), studentController.getStudentTaskHistory);
router.get("/:id/progress-snapshots", verifyToken, checkRole(allowedRoles), studentController.getStudentProgressSnapshots);


module.exports = router;