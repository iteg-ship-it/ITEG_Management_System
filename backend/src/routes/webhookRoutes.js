// webhookRoutes.js or inside your main route file
const express = require("express");
const router = express.Router();
const admissionController = require('../controllers/student/admissionProcessStudentControllers');
const studentAdmittedController= require('../controllers/student/AdmittedStudentController');
const studentController = require('../controllers/student/AdmittedStudentController');
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;


router.post("/register",admissionController.addAdmission);
router.post("/admission_flag_update", admissionController.updateAdmissionFlag, studentAdmittedController.createAdmittedStudent);
router.patch('/update_admitted_student', studentController.updateAdmittedStudent);
router.post('/update_admission', admissionController.updateAdmission);
module.exports = router;
 

