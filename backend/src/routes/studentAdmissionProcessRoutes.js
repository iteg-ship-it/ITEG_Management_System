const express = require("express");
const studentAdmissionProcess = require("../controllers/student/admissionProcessStudentControllers");
const studentAdmitted = require("../controllers/student/AdmittedStudentController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// router.post('/register', studentAdmissionProcess.addAdmission);

// router.put('/send-interview-flag/:studentId', studentAdmissionProcess.sendInterviewFlagToCentral);
// router.put('/update-admission-status/:studentId', studentAdmissionProcess.updateAdmissionStatus);
router.get('/getall', verifyToken, studentAdmissionProcess.getAllStudents);
router.get('/:id', verifyToken, studentAdmissionProcess.getStudentById);
router.put('/update_interview_flag/:studentId', verifyToken, studentAdmissionProcess.sendInterviewFlagToCentral);
router.post('/create_interview/:id', verifyToken, studentAdmissionProcess.createInterview);

router.get('/get_interviews/:id', verifyToken, studentAdmissionProcess.getInterviewsByStudentId);
router.get('/get/:id', verifyToken, studentAdmissionProcess.getStudentById);
// router.get('/attempt_count/:id', studentAdmissionProcess.getAttemptCountByStudentId);

module.exports = router;
