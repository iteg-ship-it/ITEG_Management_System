const express = require('express');
const studentAdmissionProcess = require('../modules/student/controllers/admissionProcessStudentControllers');
const studentAdmitted = require('../modules/student/controllers/admittedStudentController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const router = express.Router();


// router.post('/register', studentAdmissionProcess.addAdmission);

router.put('/update_interview_flag/:studentId', studentAdmissionProcess.sendInterviewFlagToCentral);
router.post('/create_interview/:id', studentAdmissionProcess.createInterview );
router.get('/get_interviews/:id', studentAdmissionProcess.getInterviewsByStudentId);
router.get('/getall',verifyToken, studentAdmissionProcess.getAllStudents);
module.exports = router;
