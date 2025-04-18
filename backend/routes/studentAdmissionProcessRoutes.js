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
const studentAdmissionProcess = require('../modules/student/controllers/admissionProcessStudentControllers');
const router = express.Router();


router.post('/admission-process',studentAdmissionProcess.addAdmission);
router.post('/createInterview/:id', studentAdmissionProcess.createInterview );
router.put('/updateAdmissionFlag/:id',studentAdmissionProcess.updateAdmissionFlag );
router.get('/getInterviews/:id', studentAdmissionProcess.getInterviewsByStudentId);
// router.get('/admission-dashboard',getAllAdmissions);
// router.put('/update/:id', updateStudent);
// router.delete('/delete/:id', deleteStudent);
// router.get('/track/:track', getStudentsByTrack);

// const allowedRoles = ["Super Admin", "Faculty", "Admin"];

// Download Student Data as Excel
// router.get("/download/excel",downloadStudentExcel);




module.exports = router;
