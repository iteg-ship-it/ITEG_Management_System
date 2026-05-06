const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const { departmentFilter } = require("../middlewares/departmentFilter");

const studentController = require("../controllers/student/studentController");
const placementController = require("../controllers/placement/placementController");
const attendanceController = require("../controllers/student/attendanceController");
const upload = require("../config/multerConfig");

const allowedRoles = ["superadmin", "faculty", "admin"];
const auth = [verifyToken, checkRole(allowedRoles), departmentFilter];

// =============================================================
// ── STUDENT BASIC CRUD  (mounted at /api/students)
// =============================================================

router.post("/", ...auth, studentController.createStudent);
router.get("/", ...auth, studentController.getAllStudents);
router.get("/stats", ...auth, studentController.getStudentStats);

// ── Permission ──────────────────────────────────────────────
router.get("/permission/list", ...auth, studentController.getPermissionStudents);

// ── Placement: Ready / Selected / Placed lists ───────────────
router.get("/Ready_Students", ...auth, placementController.getReadyStudents);
router.get("/selected_students", ...auth, placementController.getSelectedStudents);
router.get("/placed_students", ...auth, placementController.getPlacedStudents);

// ── Placement: Interview Management ─────────────────────────
router.post("/interviews/:id", ...auth, placementController.createInterview);
router.patch("/update/interviews/:studentId/:interviewId", ...auth, placementController.updateInterviewStatus);
router.post("/interviews/:studentId/:interviewId/add_round", ...auth, placementController.addInterviewRound);
router.patch("/reschedule/interview/:studentId/:interviewId", ...auth, placementController.rescheduleInterview);
router.get("/interview_history/:studentId", ...auth, placementController.getStudentInterviewHistory);

// ── Placement: Confirm & Manage ──────────────────────────────
router.post("/confirm_placement", ...auth,
  upload.fields([{ name: "applicationFile", maxCount: 1 }, { name: "offerLetterFile", maxCount: 1 }]),
  placementController.confirmPlacement
);
router.patch("/update_job_type", ...auth, placementController.updateJobType);
router.patch("/update-placement/:id", ...auth, placementController.updatePlacementInfo);

// ── Placement: Post ──────────────────────────────────────────
router.post("/placement_post", ...auth, placementController.createPlacementPost);
router.post("/placement_post/update/:studentId", ...auth, placementController.updatePlacementPost);

// ── Placement: Documents & Resume ───────────────────────────
router.post("/placement_documents", ...auth, placementController.uploadPlacementDocuments);
router.get("/placement_documents/:studentId", ...auth, placementController.getPlacementDocuments);
router.post("/upload_Resume_Base64", ...auth, placementController.uploadResumeBase64);

// ── Companies ────────────────────────────────────────────────
router.get("/companies", ...auth, placementController.getAllCompanies);
router.get("/companies/placed_students/:companyId", ...auth, placementController.getPlacedStudentsByCompany);
router.get("/companies/:companyName", ...auth, placementController.getCompanyByName);

// ── Attendance ───────────────────────────────────────────────
router.get("/attendance/stats", ...auth, attendanceController.getOverallAttendanceStats);

// =============================================================
// ── STUDENT BY ID  (keep /:id routes after all static routes)
// =============================================================

router.get("/:id", ...auth, studentController.getStudentById);
router.patch("/:id", ...auth, studentController.updateStudent);

// ── Readiness & Promotion ────────────────────────────────────
router.patch("/:id/readiness-status", ...auth, studentController.updateReadinessStatus);
router.post("/:id/promote", ...auth, studentController.promoteStudent);

// ── Profile Image ────────────────────────────────────────────
router.patch("/:id/profile-image", ...auth, studentController.updateProfileImage);

// ── Student Documents ────────────────────────────────────────
router.post("/:id/documents", ...auth, studentController.uploadDocument);
router.delete("/:id/documents/:docId", ...auth, studentController.deleteDocument);

// ── Permission ───────────────────────────────────────────────
router.patch("/:id/permission", ...auth, studentController.updatePermission);

// ── Tasks ────────────────────────────────────────────────────
router.get("/:id/tasks", ...auth, studentController.getStudentTasks);
router.get("/:id/tasks/sublevel/:subLevelId", ...auth, studentController.getStudentTasksBySubLevel);

// ── History & Snapshots ──────────────────────────────────────
router.get("/:id/task-history", ...auth, studentController.getStudentTaskHistory);
router.get("/:id/progress-snapshots", ...auth, studentController.getStudentProgressSnapshots);

module.exports = router;
