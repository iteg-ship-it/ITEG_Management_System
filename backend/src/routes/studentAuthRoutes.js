const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentAuthController = require("../controllers/student/studentAuthController");

const adminAuth = [verifyToken, checkRole(["superadmin", "admin", "faculty"])];
const studentAuth = [verifyToken, checkRole(["student"])];

// Public
router.post("/login", studentAuthController.studentLogin);

// Admin only — set password for a student
router.patch("/:id/set-password", ...adminAuth, studentAuthController.setStudentPassword);

// Student only
router.get("/me", ...studentAuth, studentAuthController.getMyProfile);
router.patch("/me/profile-image", ...studentAuth, studentAuthController.updateMyProfileImage);
router.patch("/me/change-password", ...studentAuth, studentAuthController.changeMyPassword);

module.exports = router;
