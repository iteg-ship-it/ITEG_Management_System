
const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentController= require("../modules/student/controllers/admittedStudentController");

const allowedRoles = ["Super Admin", "Faculty", "Admin"];



module.exports = router;
