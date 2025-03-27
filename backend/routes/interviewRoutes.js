const express = require("express");
const { getInterviews, addInterview, updateInterview } = require("../controllers/interviewController");

const router = express.Router();

// Fetch Interviews (Sab users ke liye open)
router.get("/", getInterviews);

// Add Interview Record
router.post("/", addInterview);

// Update Interview Record
router.put("/:interviewId", updateInterview);

module.exports = router;
