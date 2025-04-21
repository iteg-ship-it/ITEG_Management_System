const express = require('express');
const studentAmissionProcess = require('../modules/student/controllers/admissionProcessStudentControllers');
const studentAdmitted = require('../modules/student/controllers/admittedStudentController');

const router = express.Router();


// router.post('/admission-process', studentAmissionProcess.addAdmission);

router.put('/send-interview-flag/:studentId', studentAmissionProcess.sendInterviewFlagToCentral);
router.get('/getInterviews/:id', studentAdmissionProcess.getInterviewsByStudentId);
module.exports = router;
