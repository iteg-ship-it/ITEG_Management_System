const express = require("express");
const path = require("path");
const {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require(path.join(__dirname, "../modules/Admin/controllers/AdminController"));

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all admins (Accessible by Super Admin and Admin)
router.get("/", verifyToken, checkRole(["Admin"]), getAllAdmins);

// Get admin by ID (Accessible by Super Admin and Admin)
router.get("/:id", verifyToken, checkRole(["Admin"]), getAdminById);

// Create new admin (Only Super Admin)
router.post("/register", verifyToken, checkRole(["Admin"]), createAdmin);

// Update admin by ID (Only Super Admin)
router.put("/:id", verifyToken, checkRole(["Admin"]), updateAdmin);

// Delete admin by ID (Only Super Admin)
router.delete("/:id", verifyToken, checkRole(["Admin"]), deleteAdmin);

module.exports = router;
