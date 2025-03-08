const express = require("express");
const { getLevels, addLevel, updateLevel } = require("../controllers/levelController");

const router = express.Router();

// Fetch Levels
router.get("/", getLevels);

// Add Level
router.post("/", addLevel);

// Update Level
router.put("/:levelId", updateLevel);

module.exports = router;
