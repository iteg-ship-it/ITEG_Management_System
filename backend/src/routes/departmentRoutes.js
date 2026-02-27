const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const { 
  addDepartment, 
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  addSubdepartment,
  updateSubdepartment,
  deleteSubdepartment,
  getSubdepartmentsByDepartment,
  getLevelsBySubdepartment,
  addLevel,
  updateLevel,
  deleteLevel,
  addSubLevel,
  updateSubLevel,
  deleteSubLevel,
  getSubLevelsByLevel
} = require("../controllers/department/departmentcontroller");

const allowedRoles = ["Super Admin", "Admin", "Faculty"];

// Department Routes
router.post("/add", verifyToken, checkRole(allowedRoles), addDepartment);
router.get("/all", verifyToken, checkRole(allowedRoles), getAllDepartments);
router.patch("/update/:id", verifyToken, checkRole(allowedRoles), updateDepartment);
router.delete("/delete/:id", verifyToken, checkRole(allowedRoles), deleteDepartment);

// Subdepartment Routes
router.post("/:departmentId/subdepartments", verifyToken, checkRole(allowedRoles), addSubdepartment);
router.get("/:departmentId/subdepartments", verifyToken, checkRole(allowedRoles), getSubdepartmentsByDepartment);
router.patch("/:departmentId/subdepartments/:subdepartmentId", verifyToken, checkRole(allowedRoles), updateSubdepartment);
router.delete("/:departmentId/subdepartments/:subdepartmentId", verifyToken, checkRole(allowedRoles), deleteSubdepartment);

// Level Routes
router.post("/:departmentId/subdepartments/:subdepartmentId/levels", verifyToken, checkRole(allowedRoles), addLevel);
router.get("/:departmentId/subdepartments/:subdepartmentId/levels", verifyToken, checkRole(allowedRoles), getLevelsBySubdepartment);
router.patch("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId", verifyToken, checkRole(allowedRoles), updateLevel);
router.delete("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId", verifyToken, checkRole(allowedRoles), deleteLevel);

// SubLevel Routes
router.post("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels", verifyToken, checkRole(allowedRoles), addSubLevel);
router.get("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels", verifyToken, checkRole(allowedRoles), getSubLevelsByLevel);
router.patch("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels/:subLevelId", verifyToken, checkRole(allowedRoles), updateSubLevel);
router.delete("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels/:subLevelId", verifyToken, checkRole(allowedRoles), deleteSubLevel);

module.exports = router;
