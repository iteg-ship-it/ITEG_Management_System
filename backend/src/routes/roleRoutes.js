const express = require("express");
const roleController = require("../controllers/role/roleController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// POST /api/roles/create
router.post("/create", verifyToken, roleController.createRole);

// GET /api/roles/all
router.get("/all", verifyToken, roleController.getAllRoles);

// GET /api/roles/get/:id
router.get("/get/:id", verifyToken, roleController.getRoleById);

// PATCH /api/roles/update/:id
router.patch("/update/:id", verifyToken, roleController.updateRole);

// DELETE /api/roles/delete/:id
router.delete("/delete/:id", verifyToken, roleController.deleteRole);

module.exports = router;