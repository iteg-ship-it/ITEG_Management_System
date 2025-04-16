const express = require('express');
const { addAdmission,
    getAllAdmissions,
    updateStudent,
    deleteStudent,
    getStudentsByTrack,
    downloadStudentExcel,
    createInterview,
} = require('../modules/student/controllers/admissionProcessStudentControllers');
const StudentAdmissionProcess = require('../modules/student/models/admissionProcessStudent');
const router = express.Router();


router.post('/admission-process', addAdmission);
router.post('/createInterview/:id', createInterview );
// router.get('/admission-dashboard',getAllAdmissions);
// router.put('/update/:id', updateStudent);
// router.delete('/delete/:id', deleteStudent);
// router.get('/track/:track', getStudentsByTrack);

// const allowedRoles = ["Super Admin", "Faculty", "Admin"];

// Download Student Data as Excel
// router.get("/download/excel",downloadStudentExcel);




module.exports = router;
