const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const { addDepartment, getAllDepartments } = require("../controllers/department/departmentcontroller");

const allowedRoles = ["Super Admin", "Admin", "Faculty"];

router.post("/add", verifyToken, checkRole(allowedRoles), addDepartment);
router.get("/all", verifyToken, checkRole(allowedRoles), getAllDepartments);

module.exports = router;
const { validateDepartmentInput, validateObjectId } = require("../middlewares/departmentValidation");
const departmentController = require("../controllers/departmentController");

// const allowedRoles = ["superadmin", "admin"];

// Department CRUD Routes
router.post(
  "/",
  verifyToken,
  checkRole(allowedRoles),
  validateDepartmentInput,
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
  validateObjectId,
  departmentController.getDepartmentById
);

router.put(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  validateObjectId,
  validateDepartmentInput,
  departmentController.updateDepartment
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  validateObjectId,
  departmentController.deleteDepartment
);

module.exports = router;
