const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const Session = require("../models/Session");

const adminRoles = ["superadmin", "admin"];
const auth = [verifyToken, checkRole(adminRoles)];

// GET /api/sessions — all sessions (active + inactive for admin view)
router.get("/", verifyToken, async (req, res) => {
  try {
    const { all } = req.query;
    const filter = all === "true" ? {} : { isActive: true };
    const sessions = await Session.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/sessions — create session
router.post("/", ...auth, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ success: false, message: "Session name is required" });
    const session = await Session.create({ name });
    res.status(201).json({ success: true, message: "Session created successfully", data: session });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Session with this name already exists" });
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/sessions/:id — update session name
router.put("/:id", ...auth, async (req, res) => {
  try {
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ success: false, message: "Session name is required" });
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, message: "Session updated successfully", data: session });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Session with this name already exists" });
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/sessions/:id/activate — set this session as the active one
// Deactivates all other sessions first, then activates this one
router.patch("/:id/activate", ...auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });

    await Session.updateMany({ _id: { $ne: req.params.id } }, { $set: { isActive: false } });
    session.isActive = true;
    await session.save();

    res.status(200).json({ success: true, message: "Session activated successfully", data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/sessions/:id/deactivate — deactivate a session
router.patch("/:id/deactivate", ...auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, message: "Session deactivated successfully", data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/sessions/:id — soft delete
router.delete("/:id", ...auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    res.status(200).json({ success: true, message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
