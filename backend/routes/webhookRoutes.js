// webhookRoutes.js or inside your main route file
const express = require("express");
const router = express.Router();
const admissionController = require('../modules/student/controllers/admissionProcessStudentControllers'); // adjust path
const studentAdmittedController= require('../modules/student/controllers/admittedStudentController'); // adjust path
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;


router.post("/receive/data",admissionController.addAdmission);
router.post("/admission-flag-update", admissionController.updateAdmissionFlag, studentAdmittedController.createAdmittedStudent);
module.exports = router;
 