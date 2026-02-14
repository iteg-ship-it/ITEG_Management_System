const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const { addDepartment, getAllDepartments } = require("../controllers/department/departmentController");

const allowedRoles = ["Super Admin", "admin", "faculty"];

router.post("/add", verifyToken, checkRole(allowedRoles), addDepartment);
router.get("/all", verifyToken, checkRole(allowedRoles), getAllDepartments);

module.exports = router;
