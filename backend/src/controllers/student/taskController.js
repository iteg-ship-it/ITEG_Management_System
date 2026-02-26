const { Task, StudentTask } = require("../../models/student/task");
const AdmittedStudent = require("../../models/student/admittedStudent");
const mongoose = require("mongoose");

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

// Bulk upload tasks to selected students
exports.bulkUploadTasksToSelectedStudents = async (req, res) => {
  try {
    const { level, tasks, studentIds } = req.body;
    const createdBy = req.user.id;

    if (!level || !tasks || !Array.isArray(tasks) || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: "Level, tasks array, and studentIds array are required" });
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

    // Assign tasks to selected students only
    const studentTaskPromises = [];
    studentIds.forEach(studentId => {
      createdTasks.forEach(task => {
        studentTaskPromises.push(
          StudentTask.create({
            studentId,
            taskId: task._id
          })
        );
      });
    });

    await Promise.all(studentTaskPromises);

    res.status(201).json({
      message: `Successfully created ${createdTasks.length} tasks for ${studentIds.length} selected students in Level ${level}`,
      tasks: createdTasks
    });
  } catch (error) {
    console.error("Error uploading tasks to selected students:", error);
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

// Get student tasks grouped by subject
exports.getStudentTasks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const filter = { studentId };
    if (status) filter.status = status;

    const studentTasks = await StudentTask.find(filter)
      .populate('taskId')
      .sort({ createdAt: -1 });

    // Group tasks by subject
    const tasksBySubject = {};
    studentTasks.forEach(studentTask => {
      const subject = studentTask.taskId.subject || 'Other';
      if (!tasksBySubject[subject]) {
        tasksBySubject[subject] = [];
      }
      tasksBySubject[subject].push(studentTask);
    });

    res.status(200).json({ 
      message: "Tasks retrieved successfully",
      tasks: studentTasks,
      tasksBySubject 
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

    // Check if all tasks are completed and update readiness status
    const allTasks = await StudentTask.find({ studentId });
    const completedTasks = allTasks.filter(task => task.status === 'completed');
    
    if (allTasks.length > 0 && completedTasks.length === allTasks.length) {
      // All tasks completed - update to Ready for Interview
      await AdmittedStudent.findByIdAndUpdate(studentId, {
        readinessStatus: 'Ready for Interview'
      });
    } else if (completedTasks.length > 0) {
      // Some tasks completed - update to In Progress
      await AdmittedStudent.findByIdAndUpdate(studentId, {
        readinessStatus: 'In Progress'
      });
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
        // Overall task statistics
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

        // Subject-wise task statistics
        const subjectTaskStats = await StudentTask.aggregate([
          { $match: { studentId: student._id } },
          {
            $lookup: {
              from: 'tasks',
              localField: 'taskId',
              foreignField: '_id',
              as: 'taskDetails'
            }
          },
          { $unwind: '$taskDetails' },
          {
            $group: {
              _id: {
                subject: '$taskDetails.subject',
                status: '$status'
              },
              count: { $sum: 1 }
            }
          }
        ]);

        // Organize subject-wise stats
        const subjectStats = {};
        subjectTaskStats.forEach(stat => {
          const subject = stat._id.subject || 'Other';
          const status = stat._id.status;
          
          if (!subjectStats[subject]) {
            subjectStats[subject] = {
              pending: 0,
              'in-progress': 0,
              completed: 0
            };
          }
          
          subjectStats[subject][status] = stat.count;
        });

        const totalTasks = stats.pending + stats['in-progress'] + stats.completed;
        
        // Auto-update readiness status based on task completion
        let readinessStatus = student.readinessStatus || 'Not Ready';
        if (totalTasks > 0 && stats.completed === totalTasks) {
          readinessStatus = 'Ready for Interview';
          // Update in database
          await AdmittedStudent.findByIdAndUpdate(student._id, {
            readinessStatus: 'Ready for Interview'
          });
        } else if (totalTasks > 0 && stats.completed > 0) {
          readinessStatus = 'In Progress';
          await AdmittedStudent.findByIdAndUpdate(student._id, {
            readinessStatus: 'In Progress'
          });
        }

        return {
          ...student.toObject(),
          taskStats: stats,
          subjectTaskStats: subjectStats,
          totalTasks,
          readinessStatus
        };
      })
    );

    res.status(200).json({ students: studentsWithTasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get student task performance for report card
exports.getStudentTaskPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const taskStats = await StudentTask.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      {
        $group: {
          _id: '$taskDetails.level',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
          },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate subject-wise performance for technical skills and soft skills
    const subjectStats = await StudentTask.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'taskDetails'
        }
      },
      { $unwind: '$taskDetails' },
      {
        $group: {
          _id: '$taskDetails.subject',
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          skillName: '$_id',
          totalTasks: 1,
          completedTasks: 1,
          totalPercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$completedTasks', '$totalTasks'] },
                  100
                ]
              },
              0
            ]
          },
          remark: {
            $switch: {
              branches: [
                {
                  case: { $gte: [{ $divide: ['$completedTasks', '$totalTasks'] }, 0.9] },
                  then: 'Excellent'
                },
                {
                  case: { $gte: [{ $divide: ['$completedTasks', '$totalTasks'] }, 0.8] },
                  then: 'Good'
                },
                {
                  case: { $gte: [{ $divide: ['$completedTasks', '$totalTasks'] }, 0.6] },
                  then: 'Average'
                }
              ],
              default: 'Needs Improvement'
            }
          }
        }
      },
      { $sort: { skillName: 1 } }
    ]);

    // Separate technical and soft skills
    const technicalSkills = subjectStats.filter(skill => 
      !['Soft Skills', 'Interview Prep', 'Project Work'].includes(skill.skillName)
    );
    
    const softSkills = subjectStats.filter(skill => 
      ['Soft Skills', 'Interview Prep', 'Project Work'].includes(skill.skillName)
    ).map(skill => ({
      title: skill.skillName,
      score: skill.completedTasks,
      maxMarks: skill.totalTasks,
      percentage: skill.totalPercentage,
      remark: skill.remark
    }));

    // Calculate overall performance
    const overallStats = await StudentTask.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageCompletionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'completed'] },
                { $subtract: ['$completedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    const performance = {
      levelWiseStats: taskStats,
      technicalSkills: technicalSkills,
      softSkills: { categories: softSkills },
      overallStats: overallStats[0] || { totalTasks: 0, completedTasks: 0 },
      completionRate: overallStats[0] ? 
        Math.round((overallStats[0].completedTasks / overallStats[0].totalTasks) * 100) : 0
    };

    res.status(200).json({ performance });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create individual task for a student
exports.createIndividualTask = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { title, description, subject, priority, dueDate } = req.body;
    const createdBy = req.user.id;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Get student info to determine level
    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create the task
    const task = await Task.create({
      title,
      description,
      subject: subject || 'General',
      priority: priority || 'medium',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
      level: student.currentLevel,
      createdBy
    });

    // Assign task to the student
    const studentTask = await StudentTask.create({
      studentId,
      taskId: task._id
    });

    // Populate the task details
    await studentTask.populate('taskId');

    res.status(201).json({
      message: "Task created successfully",
      task: studentTask
    });
  } catch (error) {
    console.error("Error creating individual task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};