const express = require("express");
const router  = express.Router();
const Session = require("../models/Session");

router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const session = await Session.create({ name: req.body.name?.trim() });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Session already exists" });
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { name: req.body.name?.trim() }, { new: true, runValidators: true });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
