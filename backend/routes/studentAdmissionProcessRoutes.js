const express = require('express');
const studentAdmissionProcess = require('../modules/student/controllers/admissionProcessStudentControllers');
const studentAdmitted = require('../modules/student/controllers/admittedStudentController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const router = express.Router();


// router.post('/register', studentAdmissionProcess.addAdmission);

router.put('/send-interview-flag/:studentId', studentAdmissionProcess.sendInterviewFlagToCentral);
// router.put('/update-admission-status/:studentId', studentAdmissionProcess.updateAdmissionStatus);
router.post('/createInterview/:id', studentAdmissionProcess.createInterview );
router.get('/getInterviews/:id', studentAdmissionProcess.getInterviewsByStudentId);``
router.get('/studentgetall',verifyToken, studentAdmissionProcess.getAllStudents);
module.exports = router;
