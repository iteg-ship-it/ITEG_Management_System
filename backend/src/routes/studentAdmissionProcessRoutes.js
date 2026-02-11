const express = require("express");
const studentAdmissionProcess = require("../controllers/student/admissionProcessStudentControllers");
const studentAdmitted = require("../controllers/student/AdmittedStudentController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");
const router = express.Router();

// router.post('/register', studentAdmissionProcess.addAdmission);

// router.put('/send-interview-flag/:studentId', studentAdmissionProcess.sendInterviewFlagToCentral);
// router.put('/update-admission-status/:studentId', studentAdmissionProcess.updateAdmissionStatus);
router.get('/getall', verifyToken, checkPermission('admissionProcess', 'view'), studentAdmissionProcess.getAllStudents);
router.get('/:id', verifyToken, checkPermission('admissionProcess', 'view'), studentAdmissionProcess.getStudentById);
router.put('/update_interview_flag/:studentId', verifyToken, checkPermission('admissionProcess', 'edit'), studentAdmissionProcess.sendInterviewFlagToCentral);
router.post('/create_interview/:id', verifyToken, checkPermission('admissionProcess', 'add'), studentAdmissionProcess.createInterview);

router.get('/get_interviews/:id', verifyToken, checkPermission('admissionProcess', 'view'), studentAdmissionProcess.getInterviewsByStudentId);
router.get('/get/:id', verifyToken, checkPermission('admissionProcess', 'view'), studentAdmissionProcess.getStudentById);
// router.get('/attempt_count/:id', studentAdmissionProcess.getAttemptCountByStudentId);

module.exports = router;
