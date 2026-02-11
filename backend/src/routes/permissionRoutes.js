const express = require("express");
const permissionController = require("../controllers/user/permissionController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

const router = express.Router();

// Create or update user permissions (only superadmin)
router.post("/update", verifyToken, checkPermission('permissionManagement', 'edit'), permissionController.createOrUpdatePermissions);

// Update specific user permissions via PATCH
router.patch("/user/:userId/permission", verifyToken, permissionController.updateSpecificPermission);

// Get current user permissions
router.get("/current-user", verifyToken, permissionController.getCurrentUserPermissions);

// Get user permissions
router.get("/user/:userId", verifyToken, permissionController.getUserPermissions);

// Initialize permissions for all existing users (only superadmin)
router.post("/initialize", verifyToken, checkPermission('permissionManagement', 'add'), permissionController.initializePermissions);

// Get all users with permissions (only superadmin)
router.get("/all", verifyToken, checkPermission('permissionManagement', 'view'), permissionController.getAllUsersWithPermissions);

module.exports = router;