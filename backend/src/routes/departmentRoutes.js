const express = require("express");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const { addDepartment, getAllDepartments } = require("../controllers/department/departmentController");

const router = express.Router();

router.post("/add", verifyToken, checkRole(["Super Admin", "Admin", "Faculty"]), addDepartment);
router.get("/all", verifyToken, checkRole(["Super Admin", "Admin", "Faculty"]), getAllDepartments);

module.exports = router;
