const express = require('express');
const router = express.Router();
const taskController = require('../controllers/student/taskController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Bulk upload tasks for a level
router.post('/bulk-upload', authenticateToken, taskController.bulkUploadTasks);

// Get tasks by level
router.get('/level/:level', authenticateToken, taskController.getTasksByLevel);

// Get students by level with task statistics
router.get('/level/:level/students', authenticateToken, taskController.getStudentsByLevelWithTasks);

// Get student tasks
router.get('/student/:studentId', authenticateToken, taskController.getStudentTasks);

// Update student task status
router.put('/student/:studentId/task/:taskId', authenticateToken, taskController.updateStudentTaskStatus);

module.exports = router;