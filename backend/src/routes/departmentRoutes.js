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
  addLevel,
  updateLevel,
  deleteLevel,
  getLevelsBySubdepartment,
  addSubLevel,
  updateSubLevel,
  deleteSubLevel,
  getSubLevelsByLevel
} = require("../controllers/department/departmentController");

const allowedRoles = ["Super Admin", "admin", "faculty"];

<<<<<<< HEAD
router.post("/add", verifyToken, checkRole(allowedRoles), addDepartment);
router.get("/all", verifyToken, checkRole(allowedRoles), getAllDepartments);
=======
router.post("/add", verifyToken, checkRole(["superadmin", "admin", "faculty"]), addDepartment);
router.get("/all", verifyToken, checkRole(["superadmin", "admin", "faculty"]), getAllDepartments);
router.patch("/update/:id", verifyToken, checkRole(["superadmin", "admin", "faculty"]), updateDepartment);
router.delete("/delete/:id", verifyToken, checkRole(["superadmin", "admin", "faculty"]), deleteDepartment);

// Subdepartment routes
router.post("/:departmentId/subdepartments", verifyToken, checkRole(["superadmin", "admin", "faculty"]), addSubdepartment);
router.get("/:departmentId/subdepartments", verifyToken, checkRole(["superadmin", "admin", "faculty"]), getSubdepartmentsByDepartment);
router.patch("/:departmentId/subdepartments/:subdepartmentId", verifyToken, checkRole(["superadmin", "admin", "faculty"]), updateSubdepartment);
router.delete("/:departmentId/subdepartments/:subdepartmentId", verifyToken, checkRole(["superadmin", "admin", "faculty"]), deleteSubdepartment);

// Level routes
router.post("/:departmentId/subdepartments/:subdepartmentId/levels", verifyToken, checkRole(["superadmin", "admin", "faculty"]), addLevel);
router.get("/:departmentId/subdepartments/:subdepartmentId/levels", verifyToken, checkRole(["superadmin", "admin", "faculty"]), getLevelsBySubdepartment);
router.patch("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId", verifyToken, checkRole(["superadmin", "admin", "faculty"]), updateLevel);
router.delete("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId", verifyToken, checkRole(["superadmin", "admin", "faculty"]), deleteLevel);

// SubLevel routes
router.post("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels", verifyToken, checkRole(["superadmin", "admin", "faculty"]), addSubLevel);
router.get("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels", verifyToken, checkRole(["superadmin", "admin", "faculty"]), getSubLevelsByLevel);
router.patch("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels/:subLevelId", verifyToken, checkRole(["superadmin", "admin", "faculty"]), updateSubLevel);
router.delete("/:departmentId/subdepartments/:subdepartmentId/levels/:levelId/sublevels/:subLevelId", verifyToken, checkRole(["superadmin", "admin", "faculty"]), deleteSubLevel);
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164

module.exports = router;
