const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const subDepartmentController = require("../controllers/subDepartmentController");

const allowedRoles = ["superadmin", "admin"];

// SubDepartment CRUD Routes
router.post(
  "/",
  verifyToken,
  checkRole(allowedRoles),
  subDepartmentController.createSubDepartment
);

router.get(
  "/",
  verifyToken,
  subDepartmentController.getAllSubDepartments
);

router.get(
  "/department/:departmentId",
  verifyToken,
  subDepartmentController.getSubDepartmentsByDepartment
);

router.get(
  "/:id",
  verifyToken,
  subDepartmentController.getSubDepartmentById
);

router.put(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  subDepartmentController.updateSubDepartment
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  subDepartmentController.deleteSubDepartment
);

module.exports = router;