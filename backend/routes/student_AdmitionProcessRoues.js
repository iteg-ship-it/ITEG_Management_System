const express = require('express');
const { createStudent_Admission_process } = require('../modules/student/controllers/StudentAdmitionProcessControllers');
const router = express.Router();


router.post('/', createStudent_Admission_process);

module.exports = router;
