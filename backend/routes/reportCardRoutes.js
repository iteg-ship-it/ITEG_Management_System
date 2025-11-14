const express = require('express');
const { saveStudentReportCard, getStudentReportCard, getAllReportCards, getStudentReportCardForEdit } = require('../modules/student/controllers/studentReportCardController');

const router = express.Router();

// POST /api/reportcards - Save student report card data
router.post('/', saveStudentReportCard);

// GET /api/reportcards - Get all report cards with optional filtering
router.get('/', getAllReportCards);

// GET /api/reportcards/:studentId/edit - Get student report card for editing
router.get('/:studentId/edit', getStudentReportCardForEdit);

// Test endpoint
router.get('/test/edit', (req, res) => {
  res.json({ message: 'Edit endpoint working', timestamp: new Date() });
});

// GET /api/reportcards/:studentId - Get student report card
router.get('/:studentId', getStudentReportCard);

module.exports = router;