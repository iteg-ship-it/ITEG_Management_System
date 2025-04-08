const express = require('express');
// const { createSuperAdmin } = require('../modules/SuperAdmin/controllers/superAdminController');

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");


const SuperAdminController= require("../modules/SuperAdmin/controllers/SuperAdminController");


const router = express.Router();

// Super Admin Registration
router.post('/register',SuperAdminController.registerSuperAdmin);

// Super Admin Login
router.post('/login', SuperAdminController.loginSuperAdmin);


router.get("/superAdminList",verifyToken, checkRole(["Super Admin"]),getAllSuperAdmins)

router.get("/:id", verifyToken, checkRole(["Super Admin"]), getSuperAdminById);
module.exports = router;
