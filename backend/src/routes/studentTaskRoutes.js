const express = require("express");
const router = express.Router();
const studentTaskController = require("../controllers/studentTaskController");

// Task assignment (Admin)
router.post("/assign-to-student", studentTaskController.assignTasksToStudent);
router.post("/assign-to-multiple", studentTaskController.assignTasksToMultipleStudents);

// Student profile views (Read-only)
router.get("/student/:studentId", studentTaskController.getStudentTasks);
router.get("/student/:studentId/summary", studentTaskController.getTaskSummary);

// Student operations
router.put("/student/:studentId/task/:taskMasterId/progress", studentTaskController.updateProgress);
router.post("/student/:studentId/task/:taskMasterId/submit", studentTaskController.submitTask);

// Teacher operations
router.post("/student/:studentId/task/:taskMasterId/evaluate", studentTaskController.evaluateTask);

module.exports = router;
