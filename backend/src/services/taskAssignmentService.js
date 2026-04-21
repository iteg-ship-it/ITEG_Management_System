const TaskMaster = require("../models/syllabus/TaskMaster");
const StudentTask = require("../models/syllabus/StudentTask");
const Student = require("../models/student/Student");

/**
 * ==================== STEP 3: AUTO-ASSIGN TASKS TO STUDENTS ====================
 * When students are enrolled, automatically create StudentTask
 * with snapshot from TaskMaster
 */
async function assignTasksToStudent(studentId, syllabusVersionId) {
  const student = await Student.findById(studentId);
  if (!student) throw new Error("Student not found");

  // Get all active tasks for this syllabus
  const taskMasters = await TaskMaster.find({
    syllabusVersionId,
    isActive: true
  }).lean();

  if (taskMasters.length === 0) {
    throw new Error("No tasks found for this syllabus");
  }

  // Create StudentTaskProgress with snapshot
  const progressRecords = taskMasters.map(task => ({
    studentId,
    taskMasterId: task._id,
    syllabusVersionId: task.syllabusVersionId,
    
    // Snapshot at assignment time
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

  // Bulk insert with duplicate handling
  const result = await StudentTask.insertMany(progressRecords, { 
    ordered: false 
  }).catch(err => {
    if (err.code !== 11000) throw err;
    return { insertedCount: progressRecords.length - (err.writeErrors?.length || 0) };
  });

  return {
    studentId,
    syllabusVersionId,
    tasksAssigned: progressRecords.length,
    result
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
        syllabusVersionId,
        error: error.message, 
        success: false 
      });
    }
  }

  return results;
}

/**
 * ==================== ASSIGN TO ALL STUDENTS IN SESSION/LEVEL ====================
 */
async function assignTasksToSessionLevel(sessionId, levelId, subLevelId, syllabusVersionId) {
  const students = await Student.find({
    sessionId,
    currentLevelId: levelId,
    currentSubLevelId: subLevelId,
    status: "Active"
  }).select("_id").lean();

  const studentIds = students.map(s => s._id);

  return await assignTasksToMultipleStudents(studentIds, syllabusVersionId);
}

/**
 * ==================== GET STUDENT TASKS (VIEW ONLY) ====================
 * For student profile - read-only access
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
 * ==================== GET TASK SUMMARY FOR DASHBOARD ====================
 */
async function getStudentTaskSummary(studentId, syllabusVersionId) {
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

module.exports = {
  assignTasksToStudent,
  assignTasksToMultipleStudents,
  assignTasksToSessionLevel,
  getStudentTasks,
  getStudentTaskSummary
};
