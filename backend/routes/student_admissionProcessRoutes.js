const express = require('express');
const { createStudent_Admission_process,
    getAdmissionDashboard,
    updateStudent,
    deleteStudent,
    getStudentsByTrack
} = require('../modules/student/controllers/StudentAdmitionProcessControllers');
const StudentAdmissionProcess = require('../modules/student/models/StudentAdmissionProcess');
const router = express.Router();


router.post('/admission-process', createStudent_Admission_process);
router.get('/admission-dashboard',getAdmissionDashboard);
router.put('/update/:id', updateStudent);
router.delete('/delete/:id', deleteStudent);
router.get('/track/:track', getStudentsByTrack);

module.exports = router;
