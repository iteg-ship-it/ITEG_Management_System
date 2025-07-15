const express = require("express");
const studentAdmissionProcess = require("../modules/student/controllers/admissionProcessStudentControllers");
const studentAdmitted = require("../modules/student/controllers/AdmittedStudentController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// router.post('/register', studentAdmissionProcess.addAdmission);

// router.put('/send-interview-flag/:studentId', studentAdmissionProcess.sendInterviewFlagToCentral);
// router.put('/update-admission-status/:studentId', studentAdmissionProcess.updateAdmissionStatus);
router.get('/getall',verifyToken, studentAdmissionProcess.getAllStudents);
router.get('/:id',studentAdmissionProcess.getStudentById);
router.put('/update_interview_flag/:studentId', studentAdmissionProcess.sendInterviewFlagToCentral);
router.post('/create_interview/:id', studentAdmissionProcess.createInterview );

router.get('/get_interviews/:id', studentAdmissionProcess.getInterviewsByStudentId);
router.get('/get/:id', studentAdmissionProcess.getStudentById);
// router.get('/attempt_count/:id', studentAdmissionProcess.getAttemptCountByStudentId);

module.exports = router;
