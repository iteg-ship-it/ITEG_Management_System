const TaskMaster = require("../models/TaskMaster");
const StudentTask = require("../models/StudentTask");
const Student = require("../models/Student");

/**
 * ==================== ASSIGN TASKS FROM TASKMASTER TO STUDENT ====================
 * TaskMaster se tasks leke StudentTask create karo with snapshot
 */
async function assignTasksToStudent(studentId, syllabusVersionId) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error("Student not found");

  // Get all active tasks from TaskMaster
  const taskMasters = await TaskMaster.find({
    syllabusVersionId,
    isActive: true
  }).lean();

  if (taskMasters.length === 0) {
    throw new Error("No tasks found in TaskMaster for this syllabus");
  }

  // Create StudentTask with snapshot from TaskMaster
  const studentTasks = taskMasters.map(task => ({
    studentId,
    taskMasterId: task._id,
    syllabusVersionId: task.syllabusVersionId,
    
    // Snapshot - copied at assignment time
    snapshot: {
      subjectName: task.subjectName,
      topicName: task.topicName,
      subTopicName: task.subTopicName,
      taskTitle: task.title,
      taskType: task.type,
      maxMarks: task.maxMarks,
      cutoff: task.cutoff,
      mandatory: task.mandatory,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedAt: new Date()
    },
    
    status: "notStarted",
    progressPercentage: 0
  }));

  // Bulk insert
  const result = await StudentTask.insertMany(studentTasks, { 
    ordered: false 
  }).catch(err => {
    if (err.code !== 11000) throw err;
  });

  return {
    studentId,
    syllabusVersionId,
    tasksAssigned: studentTasks.length
  };
}

/**
 * ==================== BULK ASSIGN TO MULTIPLE STUDENTS ====================
 */
async function assignTasksToMultipleStudents(studentIds, syllabusVersionId) {
  const results = [];

  for (const studentId of studentIds) {
    try {
      const result = await assignTasksToStudent(studentId, syllabusVersionId);
      results.push({ ...result, success: true });
    } catch (error) {
      results.push({ 
        studentId, 
        error: error.message, 
        success: false 
      });
    }
  }

  return results;
}

/**
 * ==================== GET STUDENT TASKS (FOR PROFILE) ====================
 * Student ki profile me dikhane ke liye
 */
async function getStudentTasks(studentId, syllabusVersionId, filters = {}) {
  const query = { studentId, syllabusVersionId };

  if (filters.subjectName) {
    query["snapshot.subjectName"] = filters.subjectName;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  const tasks = await StudentTask.find(query, {
    snapshot: 1,
    status: 1,
    progressPercentage: 1,
    marksObtained: 1,
    isPassed: 1,
    submittedAt: 1,
    completedAt: 1,
    teacherFeedback: 1
  })
  .sort({ "snapshot.subjectName": 1, "snapshot.topicName": 1 })
  .lean();

  // Group by subject
  const groupedTasks = {};
  tasks.forEach(task => {
    const subject = task.snapshot.subjectName;
    if (!groupedTasks[subject]) {
      groupedTasks[subject] = [];
    }
    groupedTasks[subject].push(task);
  });

  return {
    studentId,
    syllabusVersionId,
    totalTasks: tasks.length,
    tasks: groupedTasks
  };
}

/**
 * ==================== GET TASK SUMMARY ====================
 */
async function getTaskSummary(studentId, syllabusVersionId) {
  const tasks = await StudentTask.find(
    { studentId, syllabusVersionId },
    { status: 1, progressPercentage: 1 }
  ).lean();

  const summary = {
    total: tasks.length,
    notStarted: 0,
    inProgress: 0,
    submitted: 0,
    completed: 0,
    failed: 0,
    overallProgress: 0
  };

  tasks.forEach(task => {
    summary[task.status]++;
  });

  const totalProgress = tasks.reduce((sum, task) => sum + task.progressPercentage, 0);
  summary.overallProgress = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;

  return summary;
}

/**
 * ==================== UPDATE PROGRESS ====================
 */
async function updateProgress(studentId, taskMasterId, progressPercentage) {
  const task = await StudentTask.findOne({ studentId, taskMasterId });
  if (!task) throw new Error("Task not found");
  if (task.isLocked) throw new Error("Task is locked");

  task.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
  
  if (progressPercentage > 0 && !task.startedAt) {
    task.startedAt = new Date();
    task.status = "inProgress";
  }

  await task.save();
  return task;
}

/**
 * ==================== SUBMIT TASK ====================
 */
async function submitTask(studentId, taskMasterId, submissionData) {
  const task = await StudentTask.findOne({ studentId, taskMasterId });
  if (!task) throw new Error("Task not found");
  if (task.isLocked) throw new Error("Task is locked");

  task.status = "submitted";
  task.submittedAt = new Date();
  task.progressPercentage = 100;
  task.submissionUrl = submissionData.submissionUrl;
  task.studentNotes = submissionData.studentNotes;

  await task.save();
  return task;
}

/**
 * ==================== EVALUATE TASK ====================
 */
async function evaluateTask(studentId, taskMasterId, marks, feedback, evaluatedBy) {
  const task = await StudentTask.findOne({ studentId, taskMasterId });
  if (!task) throw new Error("Task not found");
  if (task.isLocked) throw new Error("Task is locked");

  task.marksObtained = marks;
  task.isPassed = marks >= task.snapshot.cutoff;
  task.status = task.isPassed ? "completed" : "failed";
  task.completedAt = new Date();
  task.teacherFeedback = feedback;
  task.evaluatedBy = evaluatedBy;
  task.evaluatedAt = new Date();

  task.attempts.push({
    attemptNumber: task.attempts.length + 1,
    marksObtained: marks,
    submissionDate: new Date(),
    feedback,
    evaluatedBy
  });

  await task.save();
  return task;
}

module.exports = {
  assignTasksToStudent,
  assignTasksToMultipleStudents,
  getStudentTasks,
  getTaskSummary,
  updateProgress,
  submitTask,
  evaluateTask
};
