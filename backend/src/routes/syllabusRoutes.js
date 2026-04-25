const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const embeddedSyllabusController = require("../controllers/syllabus/embeddedSyllabusController");
const taskAssignmentController = require("../controllers/syllabus/taskAssignmentController");
const studentTaskController = require("../controllers/syllabus/studentTaskController");
const excelUpload = require("../config/excelUploadConfig");

const writeRoles = ["superadmin", "admin", "faculty"];

router.post("/", verifyToken, checkRole(writeRoles), embeddedSyllabusController.createSyllabusVersion);
router.get("/", verifyToken, embeddedSyllabusController.getAllSyllabusVersions);
router.get("/:id", verifyToken, embeddedSyllabusController.getSyllabusVersionById);
router.patch("/:id", verifyToken, checkRole(writeRoles), embeddedSyllabusController.updateDraftSyllabusVersion);
router.patch("/:id/activate", verifyToken, checkRole(writeRoles), embeddedSyllabusController.activateSyllabusVersion);
router.patch("/:id/archive", verifyToken, checkRole(writeRoles), embeddedSyllabusController.archiveSyllabusVersion);
router.post("/:id/subjects/upload", verifyToken, checkRole(writeRoles), embeddedSyllabusController.uploadSubjectWiseSyllabus);
router.post("/:id/subjects/upload-excel", verifyToken, checkRole(writeRoles), excelUpload.single("file"), embeddedSyllabusController.uploadSubjectWiseSyllabusExcel);
router.post("/:id/subjects", verifyToken, checkRole(writeRoles), embeddedSyllabusController.addSubjectToSyllabusVersion);
router.patch("/:id/subjects/:subjectId", verifyToken, checkRole(writeRoles), embeddedSyllabusController.updateSubjectInSyllabusVersion);
router.patch("/:id/subjects/:subjectId/active", verifyToken, checkRole(writeRoles), embeddedSyllabusController.toggleSubjectActive);
router.post("/:id/subjects/:subjectId/topics", verifyToken, checkRole(writeRoles), embeddedSyllabusController.addTopicToSyllabusVersion);
router.patch("/:id/subjects/:subjectId/topics/:topicId", verifyToken, checkRole(writeRoles), embeddedSyllabusController.updateTopicInSyllabusVersion);
router.patch("/:id/subjects/:subjectId/topics/:topicId/active", verifyToken, checkRole(writeRoles), embeddedSyllabusController.toggleTopicActive);
router.post("/:id/subjects/:subjectId/topics/:topicId/subtopics", verifyToken, checkRole(writeRoles), embeddedSyllabusController.addSubTopicToSyllabusVersion);
router.patch("/:id/subjects/:subjectId/topics/:topicId/subtopics/:subTopicId", verifyToken, checkRole(writeRoles), embeddedSyllabusController.updateSubTopicInSyllabusVersion);
router.patch("/:id/subjects/:subjectId/topics/:topicId/subtopics/:subTopicId/active", verifyToken, checkRole(writeRoles), embeddedSyllabusController.toggleSubTopicActive);
router.post("/:id/tasks", verifyToken, checkRole(writeRoles), embeddedSyllabusController.addTaskToSyllabusVersion);
router.patch("/:id/tasks/:taskId/active", verifyToken, checkRole(writeRoles), embeddedSyllabusController.toggleTaskActive);

router.post("/assignments/student", verifyToken, checkRole(writeRoles), taskAssignmentController.assignTasksToStudent);
router.post("/assignments/bulk", verifyToken, checkRole(writeRoles), taskAssignmentController.assignTasksToMultipleStudents);
router.post("/assignments/manual", verifyToken, checkRole(writeRoles), taskAssignmentController.assignSelectedTasksToStudents);
router.post("/assignments/session-level", verifyToken, checkRole(writeRoles), taskAssignmentController.assignTasksToSessionLevel);

router.get("/students/:studentId/tasks", verifyToken, checkRole(writeRoles), studentTaskController.getStudentTasks);
router.get("/students/:studentId/tasks/summary", verifyToken, checkRole(writeRoles), studentTaskController.getStudentTaskSummary);
router.patch("/students/:studentId/tasks/:taskId", verifyToken, checkRole(writeRoles), studentTaskController.updateStudentTaskStatus);

module.exports = router;
