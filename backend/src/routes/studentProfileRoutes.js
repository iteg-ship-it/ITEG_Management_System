const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentProfileController = require("../controllers/student/studentProfileController");
const studentPromotionController = require("../controllers/student/studentPromotionController");

const facultyRoles = ["superadmin", "admin", "faculty"];

router.get("/:studentId/profile", verifyToken, studentProfileController.getStudentProfile);
router.patch("/:studentId/profile/basic", verifyToken, checkRole(facultyRoles), studentProfileController.updateStudentBasicProfile);
router.patch("/:studentId/profile/email", verifyToken, checkRole(facultyRoles), studentProfileController.updateStudentEmail);
router.get("/:studentId/profile/tasks", verifyToken, studentProfileController.getStudentProfileTasks);
router.get("/:studentId/profile/tasks/summary", verifyToken, studentProfileController.getStudentProfileTaskSummary);
router.patch("/:studentId/profile/tasks/:taskId", verifyToken, studentProfileController.updateStudentProfileTaskStatus);
router.get("/:studentId/profile/documents", verifyToken, studentProfileController.getStudentDocuments);
router.post("/:studentId/profile/documents", verifyToken, checkRole(facultyRoles), studentProfileController.uploadStudentDocument);
router.patch("/:studentId/profile/documents/:documentId/deactivate", verifyToken, checkRole(facultyRoles), studentProfileController.deactivateStudentDocument);
router.get("/:studentId/promotion/preview", verifyToken, checkRole(facultyRoles), studentPromotionController.getPromotionPreview);
router.get("/:studentId/promotion/history", verifyToken, checkRole(facultyRoles), studentPromotionController.getPromotionHistory);
router.patch("/:studentId/promotion", verifyToken, checkRole(facultyRoles), studentPromotionController.promoteStudent);

module.exports = router;
