const express = require('express');
const { saveStudentReportCard, getStudentReportCard, getAllReportCards } = require('../modules/student/controllers/studentReportCardController');

const router = express.Router();

// POST /api/reportcards - Save student report card data
router.post('/', saveStudentReportCard);

// GET /api/reportcards - Get all report cards with optional filtering
router.get('/', getAllReportCards);

// GET /api/reportcards/:studentId - Get student report card
router.get('/:studentId', getStudentReportCard);

module.exports = router;