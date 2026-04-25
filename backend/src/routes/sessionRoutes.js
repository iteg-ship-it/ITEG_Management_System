const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const sessionController = require("../controllers/department/sessionController");

const writeRoles = ["superadmin", "admin"];

router.post("/", verifyToken, checkRole(writeRoles), sessionController.createSession);
router.get("/", verifyToken, sessionController.getAllSessions);
router.get("/:id", verifyToken, sessionController.getSessionById);
router.put("/:id", verifyToken, checkRole(writeRoles), sessionController.updateSession);
router.delete("/:id", verifyToken, checkRole(writeRoles), sessionController.deleteSession);

module.exports = router;
