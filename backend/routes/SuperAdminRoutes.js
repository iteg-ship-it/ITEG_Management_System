const express = require('express');
// const { createSuperAdmin } = require('../modules/SuperAdmin/controllers/superAdminController');

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");



// router.post('/register', createSuperAdmin);

// module.exports = router;

// const express = require('express');
const {
registerSuperAdmin,
  loginSuperAdmin,
  // getSuperAdmin,
  getAllSuperAdmins,
  getSuperAdminById
} = require('../modules/SuperAdmin/controllers/SuperAdminController');


const router = express.Router();
// const authMiddleware = require('../middlewares/authMiddleware');

// const router = express.Router();

// Super Admin Registration
router.post('/register', registerSuperAdmin);

// Super Admin Login
router.post('/login', loginSuperAdmin);

// Get Super Admin Profile (Protected)
router.get("/superadmin", verifyToken, checkRole(["superadmin"]),getAllSuperAdmins);
//  router.get('/profile', getAllSuperAdmins);

// router.get("/superadmin/:id", verifyToken, checkRole(["Super Admin"]), getSuperAdminById);
router.get("/:id", verifyToken, checkRole(["Super Admin"]), getSuperAdminById);
module.exports = router;

