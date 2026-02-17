const express = require('express');
const router = express.Router();
const taskController = require('../controllers/student/taskController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Bulk upload tasks for a level
router.post('/bulk-upload', authenticateToken, taskController.bulkUploadTasks);

// Bulk upload tasks to selected students
router.post('/bulk-upload-selected', authenticateToken, taskController.bulkUploadTasksToSelectedStudents);

// Get tasks by level
router.get('/level/:level', authenticateToken, taskController.getTasksByLevel);

// Get students by level with task statistics
router.get('/level/:level/students', authenticateToken, taskController.getStudentsByLevelWithTasks);

// Get student tasks
router.get('/student/:studentId', authenticateToken, taskController.getStudentTasks);

// Update student task status
router.put('/student/:studentId/task/:taskId', authenticateToken, taskController.updateStudentTaskStatus);

// Get student task performance for report card
router.get('/student/:studentId/performance', authenticateToken, taskController.getStudentTaskPerformance);

// Create individual task for a student
router.post('/student/:studentId/create', authenticateToken, taskController.createIndividualTask);

module.exports = router;