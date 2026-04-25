const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const studentProfileController = require("../controllers/student/studentProfileController");
const studentPromotionController = require("../controllers/student/studentPromotionController");
const studentController = require("../controllers/student/studentController");

const facultyRoles = ["superadmin", "admin", "faculty"];

router.post("/", verifyToken, checkRole(facultyRoles), studentController.createStudent);
router.get("/", verifyToken, checkRole(facultyRoles), studentController.getAllStudents);
router.get("/:studentId/profile", verifyToken, checkRole(facultyRoles), studentProfileController.getStudentProfile);
router.get("/:studentId", verifyToken, checkRole(facultyRoles), studentController.getStudentById);
router.patch("/:studentId/status", verifyToken, checkRole(facultyRoles), studentController.updateStudentStatus);
router.post("/:studentId/readiness/recalculate", verifyToken, checkRole(facultyRoles), studentController.recalculateStudentReadiness);
router.patch("/:studentId/profile/basic", verifyToken, checkRole(facultyRoles), studentProfileController.updateStudentBasicProfile);
router.patch("/:studentId/profile/email", verifyToken, checkRole(facultyRoles), studentProfileController.updateStudentEmail);
router.get("/:studentId/profile/tasks", verifyToken, checkRole(facultyRoles), studentProfileController.getStudentProfileTasks);
router.get("/:studentId/profile/tasks/summary", verifyToken, checkRole(facultyRoles), studentProfileController.getStudentProfileTaskSummary);
router.patch("/:studentId/profile/tasks/:taskId", verifyToken, checkRole(facultyRoles), studentProfileController.updateStudentProfileTaskStatus);
router.get("/:studentId/profile/documents", verifyToken, checkRole(facultyRoles), studentProfileController.getStudentDocuments);
router.post("/:studentId/profile/documents", verifyToken, checkRole(facultyRoles), studentProfileController.uploadStudentDocument);
router.patch("/:studentId/profile/documents/:documentId/deactivate", verifyToken, checkRole(facultyRoles), studentProfileController.deactivateStudentDocument);
router.get("/:studentId/promotion/preview", verifyToken, checkRole(facultyRoles), studentPromotionController.getPromotionPreview);
router.get("/:studentId/promotion/history", verifyToken, checkRole(facultyRoles), studentPromotionController.getPromotionHistory);
router.patch("/:studentId/promotion", verifyToken, checkRole(facultyRoles), studentPromotionController.promoteStudent);

module.exports = router;
