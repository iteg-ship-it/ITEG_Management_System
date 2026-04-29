const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController = require("../controllers/student/studentController");

const allowedRoles = ["superadmin", "faculty", "admin"];

// ── Basic CRUD ──────────────────────────────────────────────
router.post("/", verifyToken, checkRole(allowedRoles), studentController.createStudent);
router.get("/", verifyToken, checkRole(allowedRoles), studentController.getAllStudents);
router.get("/stats", verifyToken, checkRole(allowedRoles), studentController.getStudentStats);
router.get("/:id", verifyToken, checkRole(allowedRoles), studentController.getStudentById);
router.patch("/:id", verifyToken, checkRole(allowedRoles), studentController.updateStudent);

// ── Readiness Status ────────────────────────────────────────
router.patch("/:id/readiness-status", verifyToken, checkRole(allowedRoles), studentController.updateReadinessStatus);

// ── Promotion ────────────────────────────────────────────
router.post("/:id/promote", verifyToken, checkRole(allowedRoles), studentController.promoteStudent);

// ── Profile Image ───────────────────────────────────────────
router.patch("/:id/profile-image", verifyToken, checkRole(allowedRoles), studentController.updateProfileImage);

// ── Documents ───────────────────────────────────────────────
router.post("/:id/documents", verifyToken, checkRole(allowedRoles), studentController.uploadDocument);
router.delete("/:id/documents/:docId", verifyToken, checkRole(allowedRoles), studentController.deleteDocument);

// ── Permission ──────────────────────────────────────────────
router.get("/permission/list", verifyToken, checkRole(allowedRoles), studentController.getPermissionStudents);
router.patch("/:id/permission", verifyToken, checkRole(allowedRoles), studentController.updatePermission);

// ── Tasks ───────────────────────────────────────────────────
router.get("/:id/tasks", verifyToken, checkRole(allowedRoles), studentController.getStudentTasks);
router.get("/:id/tasks/sublevel/:subLevelId", verifyToken, checkRole(allowedRoles), studentController.getStudentTasksBySubLevel);

// ── History & Snapshots ─────────────────────────────────────
router.get("/:id/task-history", verifyToken, checkRole(allowedRoles), studentController.getStudentTaskHistory);
router.get("/:id/progress-snapshots", verifyToken, checkRole(allowedRoles), studentController.getStudentProgressSnapshots);

module.exports = router;
