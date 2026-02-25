const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const subLevelController = require("../controllers/subLevelController");

const allowedRoles = ["superadmin", "admin"];

// SubLevel CRUD Routes
router.post(
  "/",
  verifyToken,
  checkRole(allowedRoles),
  subLevelController.createSubLevel
);

router.get(
  "/",
  verifyToken,
  subLevelController.getAllSubLevels
);

router.get(
  "/level/:levelId",
  verifyToken,
  subLevelController.getSubLevelsByLevel
);

router.get(
  "/:id",
  verifyToken,
  subLevelController.getSubLevelById
);

router.put(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  subLevelController.updateSubLevel
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  subLevelController.deleteSubLevel
);

module.exports = router;