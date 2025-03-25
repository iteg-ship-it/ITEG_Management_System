const express = require('express');
const { createStudent_Admission_process,getAdmissionDashboard} = require('../modules/student/controllers/StudentAdmitionProcessControllers');
const StudentAdmissionProcess = require('../modules/student/models/StudentAdmissionProcess');
const router = express.Router();


router.post('/admission-process', createStudent_Admission_process);
router.get('/admission-dashboard',getAdmissionDashboard);

module.exports = router;
