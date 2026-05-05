const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/placement/deptPlacementController");

const allowedRoles = ["superadmin", "admin"];

router.get("/:id/overview",          verifyToken, checkRole(allowedRoles), ctrl.getDeptOverview);
router.get("/:id/funnel",            verifyToken, checkRole(allowedRoles), ctrl.getDeptFunnel);
router.get("/:id/status-breakdown",  verifyToken, checkRole(allowedRoles), ctrl.getDeptStatusBreakdown);
router.get("/:id/alerts",            verifyToken, checkRole(allowedRoles), ctrl.getDeptAlerts);
router.get("/:id/ready-students",    verifyToken, checkRole(allowedRoles), ctrl.getDeptReadyStudents);
router.get("/:id/recent-placements", verifyToken, checkRole(allowedRoles), ctrl.getDeptRecentPlacements);
router.get("/:id/top-companies",     verifyToken, checkRole(allowedRoles), ctrl.getDeptTopCompanies);

module.exports = router;
