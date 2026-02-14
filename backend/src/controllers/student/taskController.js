const { Task, StudentTask } = require("../../models/student/task");
const AdmittedStudent = require("../../models/student/admittedStudent");

// Bulk upload tasks for a level
exports.bulkUploadTasks = async (req, res) => {
  try {
    const { level, tasks } = req.body;
    const createdBy = req.user.id;

    if (!level || !tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: "Level and tasks array are required" });
    }

    // Create tasks
    const taskPromises = tasks.map(task => 
      Task.create({
        ...task,
        level,
        createdBy
      })
    );

    const createdTasks = await Promise.all(taskPromises);

    // Get all students in this level
    const students = await AdmittedStudent.find({ currentLevel: level });

    // Assign tasks to all students in the level
    const studentTaskPromises = [];
    students.forEach(student => {
      createdTasks.forEach(task => {
        studentTaskPromises.push(
          StudentTask.create({
            studentId: student._id,
            taskId: task._id
          })
        );
      });
    });

    await Promise.all(studentTaskPromises);

    res.status(201).json({
      message: `Successfully created ${createdTasks.length} tasks for ${students.length} students in Level ${level}`,
      tasks: createdTasks
    });
  } catch (error) {
    console.error("Error uploading tasks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tasks by level
exports.getTasksByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const tasks = await Task.find({ level, isActive: true }).populate('createdBy', 'name');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get student tasks
exports.getStudentTasks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const filter = { studentId };
    if (status) filter.status = status;

    const studentTasks = await StudentTask.find(filter)
      .populate('taskId')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      message: "Tasks retrieved successfully",
      tasks: studentTasks 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update student task status
exports.updateStudentTaskStatus = async (req, res) => {
  try {
    const { studentId, taskId } = req.params;
    const { status, notes, submissionUrl } = req.body;

    const updateData = { status, notes };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    if (submissionUrl) {
      updateData.submissionUrl = submissionUrl;
    }

    const studentTask = await StudentTask.findOneAndUpdate(
      { studentId, taskId },
      updateData,
      { new: true }
    ).populate('taskId');

    if (!studentTask) {
      return res.status(404).json({ message: "Student task not found" });
    }

    res.status(200).json({ message: "Task updated successfully", studentTask });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get students by level with task statistics
exports.getStudentsByLevelWithTasks = async (req, res) => {
  try {
    const { level } = req.params;
    
    const students = await AdmittedStudent.find({ currentLevel: level });
    
    const studentsWithTasks = await Promise.all(
      students.map(async (student) => {
        const taskStats = await StudentTask.aggregate([
          { $match: { studentId: student._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const stats = {
          pending: 0,
          'in-progress': 0,
          completed: 0
        };

        taskStats.forEach(stat => {
          stats[stat._id] = stat.count;
        });

        return {
          ...student.toObject(),
          taskStats: stats,
          totalTasks: stats.pending + stats['in-progress'] + stats.completed
        };
      })
    );

    res.status(200).json({ students: studentsWithTasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};