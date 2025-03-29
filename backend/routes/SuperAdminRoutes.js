const express = require('express');
const { 
  registerSuperAdmin, 
  loginSuperAdmin, 
  getAllSuperAdmins, 
  getSuperAdminById 
} = require('../modules/SuperAdmin/controllers/SuperAdminController');

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

const router = express.Router();

// Super Admin Registration
router.post('/register', registerSuperAdmin);

// Super Admin Login
router.post('/login', loginSuperAdmin);

// ✅ Route to get all Super Admins
router.get("/", verifyToken, checkRole(["Super Admin"]), getAllSuperAdmins);

// ✅ Route to get a Super Admin by ID
router.get("/:id", verifyToken, checkRole(["Super Admin"]), getSuperAdminById);

module.exports = router;
