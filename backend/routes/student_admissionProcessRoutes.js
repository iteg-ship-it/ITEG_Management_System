const express = require('express');
const { createStudent_Admission_process,
    getAdmissionDashboard,
    updateStudent,
    deleteStudent,
    getStudentsByTrack,
    downloadStudentExcel
} = require('../modules/student/controllers/StudentAdmitionProcessControllers');
const StudentAdmissionProcess = require('../modules/student/models/StudentAdmissionProcess');
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

const allowedRoles = ["Super Admin", "Faculty", "Admin"];

router.post('/admission-process', createStudent_Admission_process);
router.get('/admission-dashboard',verifyToken, checkRole(allowedRoles),getAdmissionDashboard);
router.put('/update/:id', updateStudent);
router.delete('/delete/:id', deleteStudent);
router.get('/track/:track', getStudentsByTrack);


// Download Student Data as Excel
router.get("/download/excel",downloadStudentExcel);




module.exports = router;
