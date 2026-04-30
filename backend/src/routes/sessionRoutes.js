const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const sessionController = require("../controllers/sessionController");

const allowedRoles = ["superadmin", "admin"];

// Session CRUD Routes
router.post(
  "/",
  verifyToken,
  checkRole(allowedRoles),
  sessionController.createSession
);

router.get(
  "/",
  verifyToken,
  sessionController.getAllSessions
);

router.get(
  "/:id",
  verifyToken,
  sessionController.getSessionById
);

router.put(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  sessionController.updateSession
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(allowedRoles),
  sessionController.deleteSession
);

module.exports = router;