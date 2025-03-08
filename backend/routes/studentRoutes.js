const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

// Student Routes
router.post("/register", studentController.registerStudent);
router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentById);
router.put("/:id", studentController.updateStudent);
router.delete("/:id", studentController.deleteStudent);
router.post("/migrate", verifyToken, checkRole(["Faculty", "Admin", "Super Admin"]), studentController.migrateStudents);

module.exports = router;
