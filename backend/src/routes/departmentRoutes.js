const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const departmentController = require("../controllers/departmentController");

const allowedRoles = ["superadmin", "admin"];

// Department CRUD Routes
router.post(
  "/",
  verifyToken,
  checkRole(allowedRoles),
  departmentController.createDepartment
);

router.get(
  "/",
  verifyToken,
  departmentController.getAllDepartments
);

router.get(
  "/:id",
  verifyToken,
  departmentController.getDepartmentById
);

router.put(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  departmentController.updateDepartment
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  departmentController.deleteDepartment
);

module.exports = router;