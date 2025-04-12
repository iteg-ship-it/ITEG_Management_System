const express = require('express');
const { addAdmission,
    getAllAdmissions,
    updateStudent,
    deleteStudent,
    // getStudentsByTrack,
    // downloadStudentExcel
} = require('../modules/student/controllers/StudentAdmitionProcessControllers');
const StudentAdmissionProcess = require('../modules/student/models/StudentAdmissionProcess');
const router = express.Router();


router.post('/admission-process', addAdmission);
// router.get('/admission-dashboard',getAllAdmissions);
// router.put('/update/:id', updateStudent);
// router.delete('/delete/:id', deleteStudent);
// router.get('/track/:track', getStudentsByTrack);

// const allowedRoles = ["Super Admin", "Faculty", "Admin"];

// Download Student Data as Excel
// router.get("/download/excel",downloadStudentExcel);




module.exports = router;
