const express = require('express');
const { createStudent_Admission_process,
    getAdmissionDashboard,
    updateStudent,
    deleteStudent,
    getStudentsByTrack,
    downloadStudentExcel
} = require('../modules/student/controllers/admissionProcessStudentControllers');
const StudentAdmissionProcess = require('../modules/student/models/admissionProcessStudent');
const router = express.Router();


router.post('/admission-process', createStudent_Admission_process);
router.get('/admission-dashboard',getAdmissionDashboard);
router.put('/update/:id', updateStudent);
router.delete('/delete/:id', deleteStudent);
router.get('/track/:track', getStudentsByTrack);

const allowedRoles = ["Super Admin", "Faculty", "Admin"];

// Download Student Data as Excel
router.get("/download/excel",downloadStudentExcel);




module.exports = router;
