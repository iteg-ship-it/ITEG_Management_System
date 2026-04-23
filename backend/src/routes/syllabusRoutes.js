const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const embeddedSyllabusController = require("../controllers/syllabus/embeddedSyllabusController");
const taskAssignmentController = require("../controllers/syllabus/taskAssignmentController");
const studentTaskController = require("../controllers/syllabus/studentTaskController");

const writeRoles = ["superadmin", "admin", "faculty"];

router.post("/", verifyToken, checkRole(writeRoles), embeddedSyllabusController.createSyllabusVersion);
router.get("/", verifyToken, embeddedSyllabusController.getAllSyllabusVersions);
router.get("/:id", verifyToken, embeddedSyllabusController.getSyllabusVersionById);
router.patch("/:id", verifyToken, checkRole(writeRoles), embeddedSyllabusController.updateDraftSyllabusVersion);
router.patch("/:id/activate", verifyToken, checkRole(writeRoles), embeddedSyllabusController.activateSyllabusVersion);
router.patch("/:id/archive", verifyToken, checkRole(writeRoles), embeddedSyllabusController.archiveSyllabusVersion);
router.post("/:id/tasks", verifyToken, checkRole(writeRoles), embeddedSyllabusController.addTaskToSyllabusVersion);
router.patch("/:id/tasks/:taskId/active", verifyToken, checkRole(writeRoles), embeddedSyllabusController.toggleTaskActive);

router.post("/assignments/student", verifyToken, checkRole(writeRoles), taskAssignmentController.assignTasksToStudent);
router.post("/assignments/bulk", verifyToken, checkRole(writeRoles), taskAssignmentController.assignTasksToMultipleStudents);
router.post("/assignments/session-level", verifyToken, checkRole(writeRoles), taskAssignmentController.assignTasksToSessionLevel);

router.get("/students/:studentId/tasks", verifyToken, studentTaskController.getStudentTasks);
router.get("/students/:studentId/tasks/summary", verifyToken, studentTaskController.getStudentTaskSummary);
router.patch("/students/:studentId/tasks/:taskId", verifyToken, studentTaskController.updateStudentTaskStatus);

module.exports = router;
