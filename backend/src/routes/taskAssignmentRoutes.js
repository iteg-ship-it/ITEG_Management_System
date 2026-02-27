const express = require("express");
const router = express.Router();
const taskAssignmentController = require("../controllers/taskAssignmentController");

// Task assignment
router.post("/assign-to-student", taskAssignmentController.assignTasksToStudent);
router.post("/assign-to-multiple", taskAssignmentController.assignTasksToMultipleStudents);
router.post("/assign-to-session-level", taskAssignmentController.assignTasksToSessionLevel);

// Student task views (read-only)
router.get("/student/:studentId", taskAssignmentController.getStudentTasks);
router.get("/student/:studentId/summary", taskAssignmentController.getStudentTaskSummary);

module.exports = router;
