const Student = require("../models/student/Student");
const SyllabusVersion = require("../models/syllabus/SyllabusVersion");
const StudentTask = require("../models/syllabus/StudentTask");

const buildTaskEntries = (syllabusVersion) => {
  const tasks = [];

  for (const subject of syllabusVersion.subjects || []) {
    if (!subject.isActive) continue;

    for (const topic of subject.topics || []) {
      if (!topic.isActive) continue;

      for (const task of topic.tasks || []) {
        if (!task.isActive) continue;

        tasks.push({
          taskId: task._id,
          subjectId: subject._id,
          topicId: topic._id,
          subTopicId: null,
          subjectName: subject.name,
          topicName: topic.name,
          subTopicName: null,
          taskNodeType: "topic",
          title: task.title,
          description: task.description || "",
          type: task.type || "assignment",
          mandatory: task.mandatory !== false,
          maxMarks: typeof task.maxMarks === "number" ? task.maxMarks : 5
        });
      }

      for (const subTopic of topic.subTopics || []) {
        if (!subTopic.isActive) continue;

        for (const task of subTopic.tasks || []) {
          if (!task.isActive) continue;

          tasks.push({
            taskId: task._id,
            subjectId: subject._id,
            topicId: topic._id,
            subTopicId: subTopic._id,
            subjectName: subject.name,
            topicName: topic.name,
            subTopicName: subTopic.name,
            taskNodeType: "subTopic",
            title: task.title,
            description: task.description || "",
            type: task.type || "assignment",
            mandatory: task.mandatory !== false,
            maxMarks: typeof task.maxMarks === "number" ? task.maxMarks : 5
          });
        }
      }
    }
  }

  return tasks;
};

const getSyllabusVersionForStudent = async (student, syllabusVersionId) => {
  if (syllabusVersionId) {
    const version = await SyllabusVersion.findOne({
      _id: syllabusVersionId,
      isActive: true
    });

    if (!version) {
      throw new Error("Syllabus version not found");
    }

    return version;
  }

  if (student.syllabusVersionId) {
    const version = await SyllabusVersion.findOne({
      _id: student.syllabusVersionId,
      isActive: true
    });

    if (version) {
      return version;
    }
  }

  const activeVersion = await SyllabusVersion.findOne({
    sessionId: student.sessionId,
    levelId: student.currentLevelId,
    subLevelId: student.currentSubLevelId,
    status: "active",
    isActive: true
  }).sort({ createdAt: -1 });

  if (!activeVersion) {
    throw new Error("No active syllabus found for this student");
  }

  return activeVersion;
};

const assignTasksToStudent = async (studentId, syllabusVersionId) => {
  const student = await Student.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  const syllabusVersion = await getSyllabusVersionForStudent(student, syllabusVersionId);
  const taskEntries = buildTaskEntries(syllabusVersion);

  if (taskEntries.length === 0) {
    throw new Error("No active tasks found in syllabus");
  }

  const existingTasks = await StudentTask.find({
    studentId: student._id,
    syllabusVersionId: syllabusVersion._id
  }).select("_id taskId");

  const existingMap = new Map(
    existingTasks.map((item) => [item.taskId.toString(), item])
  );

  let createdCount = 0;
  let updatedCount = 0;

  for (const entry of taskEntries) {
    const payload = {
      syllabusVersionId: syllabusVersion._id,
      subjectId: entry.subjectId,
      topicId: entry.topicId,
      subTopicId: entry.subTopicId,
      subjectName: entry.subjectName,
      topicName: entry.topicName,
      subTopicName: entry.subTopicName,
      taskNodeType: entry.taskNodeType,
      title: entry.title,
      description: entry.description,
      type: entry.type,
      mandatory: entry.mandatory,
      maxMarks: entry.maxMarks,
      isActive: true
    };

    const existing = existingMap.get(entry.taskId.toString());

    if (existing) {
      await StudentTask.updateOne(
        { _id: existing._id },
        { $set: payload }
      );
      updatedCount += 1;
      continue;
    }

    await StudentTask.create({
      studentId: student._id,
      taskId: entry.taskId,
      ...payload
    });
    createdCount += 1;
  }

  const activeTaskIds = taskEntries.map((task) => task.taskId);
  await StudentTask.updateMany(
    {
      studentId: student._id,
      syllabusVersionId: syllabusVersion._id,
      taskId: { $nin: activeTaskIds }
    },
    { $set: { isActive: false } }
  );

  if (!student.syllabusVersionId || student.syllabusVersionId.toString() !== syllabusVersion._id.toString()) {
    student.syllabusVersionId = syllabusVersion._id;
    await student.save();
  }

  return {
    studentId: student._id,
    syllabusVersionId: syllabusVersion._id,
    createdCount,
    updatedCount,
    totalTasks: taskEntries.length
  };
};

const assignTasksToMultipleStudents = async (studentIds, syllabusVersionId) => {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    throw new Error("studentIds must be a non-empty array");
  }

  const results = [];

  for (const studentId of studentIds) {
    try {
      const result = await assignTasksToStudent(studentId, syllabusVersionId);
      results.push({ success: true, studentId, ...result });
    } catch (error) {
      results.push({ success: false, studentId, message: error.message });
    }
  }

  return results;
};

const assignTasksToSessionLevel = async (sessionId, levelId, subLevelId, syllabusVersionId) => {
  const filter = {};

  if (sessionId) filter.sessionId = sessionId;
  if (levelId) filter.currentLevelId = levelId;
  if (subLevelId) filter.currentSubLevelId = subLevelId;

  const students = await Student.find(filter).select("_id");

  if (students.length === 0) {
    return [];
  }

  return assignTasksToMultipleStudents(
    students.map((student) => student._id),
    syllabusVersionId
  );
};

const getStudentTasks = async (studentId, syllabusVersionId, filters = {}) => {
  const query = {
    studentId,
    syllabusVersionId,
    isActive: true
  };

  if (filters.status) query.status = filters.status;
  if (filters.subjectId) query.subjectId = filters.subjectId;
  if (filters.topicId) query.topicId = filters.topicId;
  if (filters.subTopicId) query.subTopicId = filters.subTopicId;

  const tasks = await StudentTask.find(query).sort({
    subjectName: 1,
    topicName: 1,
    subTopicName: 1,
    createdAt: 1
  });

  return tasks;
};

const getStudentTaskSummary = async (studentId, syllabusVersionId) => {
  const tasks = await StudentTask.find({
    studentId,
    syllabusVersionId,
    isActive: true
  }).select("status");

  const summary = {
    total: tasks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    progressPercent: 0
  };

  for (const task of tasks) {
    summary[task.status] += 1;
  }

  if (summary.total > 0) {
    summary.progressPercent = Math.round((summary.completed / summary.total) * 100);
  }

  return summary;
};

const updateStudentTaskStatus = async (studentId, taskId, payload) => {
  const studentTask = await StudentTask.findOne({
    studentId,
    taskId,
    isActive: true
  });

  if (!studentTask) {
    throw new Error("Student task not found");
  }

  if (payload.status) {
    studentTask.status = payload.status;

    if (payload.status === "inProgress" && !studentTask.startedAt) {
      studentTask.startedAt = new Date();
    }

    if (payload.status === "completed") {
      studentTask.completedAt = new Date();
      if (!studentTask.startedAt) {
        studentTask.startedAt = new Date();
      }
    }

    if (payload.status !== "completed") {
      studentTask.completedAt = null;
    }
  }

  if (payload.marks !== undefined) {
    studentTask.marks = payload.marks;
  }

  if (payload.notes !== undefined) {
    studentTask.notes = payload.notes;
  }

  await studentTask.save();
  const actorId = payload.actor?.id || payload.actor?._id || null;
  const actorName = payload.actor?.name || "";
  const actorRole = payload.actor?.role || "";

  await Student.findByIdAndUpdate(studentId, {
    $push: {
      taskSnapshots: {
        taskId: studentTask.taskId,
        status: studentTask.status,
        marks: studentTask.marks,
        maxMarks: studentTask.maxMarks,
        notes: studentTask.notes,
        changedBy: actorId,
        changedByName: actorName,
        changedByRole: actorRole,
        changedAt: new Date()
      },
      eventHistory: {
        type: "task",
        action: "task_status_updated",
        title: `Task ${studentTask.status}`,
        description: `${studentTask.title} updated to ${studentTask.status}`,
        meta: {
          taskId: studentTask.taskId,
          status: studentTask.status,
          marks: studentTask.marks,
          maxMarks: studentTask.maxMarks,
          taskNodeType: studentTask.taskNodeType
        },
        createdBy: actorId,
        createdByName: actorName,
        createdByRole: actorRole,
        createdAt: new Date()
      }
    }
  });

  const { syncStudentReadiness } = require("./studentService");
  await syncStudentReadiness(studentId);

  return studentTask;
};

const syncSyllabusTasksToStudents = async (syllabusVersionId) => {
  const students = await Student.find({ syllabusVersionId }).select("_id");

  const results = [];
  for (const student of students) {
    try {
      const result = await assignTasksToStudent(student._id, syllabusVersionId);
      results.push({ success: true, studentId: student._id, ...result });
    } catch (error) {
      results.push({ success: false, studentId: student._id, message: error.message });
    }
  }

  return results;
};

module.exports = {
  buildTaskEntries,
  assignTasksToStudent,
  assignTasksToMultipleStudents,
  assignTasksToSessionLevel,
  getStudentTasks,
  getStudentTaskSummary,
  updateStudentTaskStatus,
  syncSyllabusTasksToStudents
};
