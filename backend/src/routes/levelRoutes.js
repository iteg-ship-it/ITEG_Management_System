const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const levelController = require("../controllers/levelController");

const allowedRoles = ["superadmin", "admin"];

// Level CRUD Routes
router.post(
  "/",
  verifyToken,
  checkRole(allowedRoles),
  levelController.createLevel
);

router.get(
  "/",
  verifyToken,
  levelController.getAllLevels
);

router.get(
  "/department/:departmentId",
  verifyToken,
  levelController.getLevelsByDepartment
);

router.get(
  "/:id",
  verifyToken,
  levelController.getLevelById
);

router.put(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  levelController.updateLevel
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  levelController.deleteLevel
);

module.exports = router;