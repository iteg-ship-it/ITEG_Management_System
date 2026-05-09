const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const Task = require("../models/syllabus/Task");
const { syncTasksToSubLevelStudents } = require("../services/taskAssignmentService");

const writeRoles = ["superadmin", "admin", "faculty"];

// Create general task (not tied to syllabus)
router.post("/general", verifyToken, checkRole(writeRoles), async (req, res) => {
  try {
    const { levelId, subLevelId, title, description, type, priority, maxMarks, timeDays, measurablePoints, dueDate } = req.body;
    
    if (!levelId || !subLevelId || !title) {
      return res.status(400).json({ 
        success: false, 
        message: "levelId, subLevelId and title are required" 
      });
    }

    const task = await Task.create({
      levelId,
      subLevelId,
      title: title.trim(),
      description: description || "",
      type: type || "assignment",
      priority: priority || "medium",
      maxMarks: typeof maxMarks === "number" ? maxMarks : 5,
      timeDays: timeDays ? Number(timeDays) : null,
      measurablePoints: measurablePoints || "",
      dueDate: dueDate || null,
      isGeneralTask: true,
      taskNodeType: "general",
      isActive: true
    });

    // Sync to all students in this sublevel
    await syncTasksToSubLevelStudents(null, subLevelId).catch(() => {});

    res.status(201).json({
      success: true,
      message: "General task created successfully",
      data: task
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update task
router.patch("/:taskId", verifyToken, checkRole(writeRoles), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Sync changes to students
    if (task.syllabusVersionId) {
      await syncTasksToSubLevelStudents(task.syllabusVersionId).catch(() => {});
    } else if (task.subLevelId) {
      await syncTasksToSubLevelStudents(null, task.subLevelId).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete task (soft delete)
router.delete("/:taskId", verifyToken, checkRole(writeRoles), async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { isActive: false, deletedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tasks by level/sublevel (including general tasks)
router.get("/level/:subLevelId", verifyToken, async (req, res) => {
  try {
    const { subLevelId } = req.params;
    const { syllabusVersionId } = req.query;

    let filter = { 
      $or: [
        { subLevelId, isGeneralTask: true },
        { syllabusVersionId }
      ],
      isActive: true 
    };

    if (!syllabusVersionId) {
      filter = { subLevelId, isGeneralTask: true, isActive: true };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;