const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  createTask,
  updateTask,
  getTaskById,
  getAllTasks,
} = require("../controllers/taskMasterController");

router.use(verifyToken);

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);

module.exports = router;
