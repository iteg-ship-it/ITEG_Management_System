const express = require('express');
// const { addAdmission,
//     getAllAdmissions,
//     updateStudent,
//     deleteStudent,
//     getStudentsByTrack,
//     downloadStudentExcel,
//     createInterview,
//     updateAdmissionFlag 
// } = require('../modules/student/controllers/admissionProcessStudentControllers');
// const StudentAdmissionProcess = require('../modules/student/models/admissionProcessStudent');
const StudentAdmissionProcess = require('../modules/student/controllers/admissionProcessStudentControllers');
const router = express.Router();


router.post('/admission-process',StudentAdmissionProcess.addAdmission);
router.post('/createInterview/:id', StudentAdmissionProcess.createInterview );
router.put('/updateAdmissionFlag/:id',StudentAdmissionProcess.updateAdmissionFlag );
router.get('/getInterviews/:id', StudentAdmissionProcess.getInterviewsByStudentId);
// router.get('/admission-dashboard',getAllAdmissions);
// router.put('/update/:id', updateStudent);
// router.delete('/delete/:id', deleteStudent);
// router.get('/track/:track', getStudentsByTrack);

// const allowedRoles = ["Super Admin", "Faculty", "Admin"];

// Download Student Data as Excel
// router.get("/download/excel",downloadStudentExcel);




module.exports = router;
