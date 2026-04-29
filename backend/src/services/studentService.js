const Student = require("../models/student/Student");
const Level = require("../models/department/Level");
const SubLevel = require("../models/department/SubLevel");
const StudentTask = require("../models/syllabus/StudentTask");
const SyllabusVersion = require("../models/syllabus/SyllabusVersion");
const Session = require("../models/Session");
const StudentEventLog = require("../models/student/StudentEventLog");
const StudentProgressSnapshot = require("../models/student/StudentProgressSnapshot");
const { assignTasksToStudent } = require("./taskAssignmentService");

// Called after every task status update — auto-promotes if 100% tasks done
const syncStudentReadiness = async (studentId) => {
  const student = await Student.findById(studentId).select(
    "currentLevelId currentSubLevelId syllabusVersionId sessionId subDepartmentId status"
  );
  if (!student || student.status !== "Active") return;

  const tasks = await StudentTask.find({
    studentId,
    syllabusVersionId: student.syllabusVersionId,
    subLevelId: student.currentSubLevelId,
    isActive: true,
  }).select("status mandatory");

  if (tasks.length === 0) return;

  const mandatoryTasks = tasks.filter((t) => t.mandatory);
  if (mandatoryTasks.length === 0) return;

  const allMandatoryDone = mandatoryTasks.every((t) => t.status === "completed");
  if (!allMandatoryDone) return;

  // Guard: check if student already has a pending promotion log for this sublevel
  // to avoid double-trigger on concurrent updates
  const recentPromotion = await StudentEventLog.findOne({
    studentId,
    type: "promotion",
    "meta.prevSubLevelId": student.currentSubLevelId,
  });
  if (recentPromotion) return; // already promoted from this sublevel

  try {
    await promoteToNextSubLevel(studentId, null, { isAuto: true });
  } catch (err) {
    // Silently ignore — e.g. "already completed all levels"
    console.log(`Auto-promotion skipped for ${studentId}: ${err.message}`);
  }
};

// Core promotion logic — used by both auto and manual
const promoteToNextSubLevel = async (studentId, actorUser = null, options = {}) => {
  const { isAuto = false } = options;

  const student = await Student.findById(studentId);
  if (!student) throw new Error("Student not found");
  if (student.status !== "Active") throw new Error("Only active students can be promoted");

  // Find next SubLevel in same Level (by order)
  const currentSubLevel = await SubLevel.findById(student.currentSubLevelId);
  if (!currentSubLevel) throw new Error("Current sub-level not found");

  let nextSubLevel = await SubLevel.findOne({
    levelId: student.currentLevelId,
    order: { $gt: currentSubLevel.order },
    isActive: true,
  }).sort({ order: 1 });

  let nextLevel = null;
  let promotedToNewLevel = false;

  // No next sublevel in current level → find next Level
  if (!nextSubLevel) {
    const currentLevel = await Level.findById(student.currentLevelId);
    if (!currentLevel) throw new Error("Current level not found");

    nextLevel = await Level.findOne({
      subDepartmentId: student.subDepartmentId,
      order: { $gt: currentLevel.order },
      isActive: true,
    }).sort({ order: 1 });

    if (!nextLevel) throw new Error("Student has already completed all levels");

    // First sublevel of next level
    nextSubLevel = await SubLevel.findOne({
      levelId: nextLevel._id,
      isActive: true,
    }).sort({ order: 1 });

    if (!nextSubLevel) throw new Error("No active sub-level found in next level");
    promotedToNewLevel = true;
  }

  const targetLevelId = promotedToNewLevel ? nextLevel._id : student.currentLevelId;

  // Find latest active syllabus for new position
  const latestSession = await Session.findOne({ isActive: true }).sort({ createdAt: -1 });
  if (!latestSession) throw new Error("No active session found");

  const newSyllabus = await SyllabusVersion.findOne({
    sessionId: latestSession._id,
    levelId: targetLevelId,
    subLevelId: nextSubLevel._id,
    status: "active",
    isActive: true,
  }).sort({ createdAt: -1 });

  if (!newSyllabus) throw new Error("No active syllabus found for the next sub-level");

  // Update student position
  const prevLevelId = student.currentLevelId;
  const prevSubLevelId = student.currentSubLevelId;
  const prevSyllabusVersionId = student.syllabusVersionId;

  // 📸 Save final snapshot of previous sublevel BEFORE updating student position
  try {
    const prevTasks = await StudentTask.find({
      studentId,
      syllabusVersionId: prevSyllabusVersionId,
      subLevelId: prevSubLevelId,
      isActive: true,
    }).select("status marks subjectId subjectName");

    const [prevSession, prevLevel, prevSubLevel, prevSyllabus] = await Promise.all([
      Session.findById(student.sessionId).select("name"),
      Level.findById(prevLevelId).select("name"),
      SubLevel.findById(prevSubLevelId).select("name"),
      SyllabusVersion.findById(prevSyllabusVersionId).select("title version"),
    ]);

    const completedTasks = prevTasks.filter((t) => t.status === "completed");
    const completedWithMarks = completedTasks.filter((t) => typeof t.marks === "number");
    const averageMarks = completedWithMarks.length > 0
      ? Number((completedWithMarks.reduce((s, t) => s + t.marks, 0) / completedWithMarks.length).toFixed(2))
      : 0;

    const baseContext = {
      sessionId: student.sessionId,
      sessionName: prevSession?.name || "",
      levelId: prevLevelId,
      levelName: prevLevel?.name || "",
      subLevelId: prevSubLevelId,
      subLevelName: prevSubLevel?.name || "",
      syllabusVersionId: prevSyllabusVersionId,
      syllabusVersionTitle: prevSyllabus?.title || "",
      syllabusVersionCode: prevSyllabus?.version || "",
    };

    // Overall snapshot
    const snapshotsToSave = [{
      studentId,
      snapshotScope: "overall",
      ...baseContext,
      totalTasks: prevTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: prevTasks.filter((t) => t.status === "pending").length,
      inProgressTasks: prevTasks.filter((t) => t.status === "inProgress").length,
      averageMarks,
      changedBy: actorUser?.id || actorUser?._id || null,
      changedByName: actorUser?.name || "",
      changedByRole: actorUser?.role || "",
      changedAt: new Date(),
    }];

    // Subject-wise snapshots
    const subjectMap = {};
    prevTasks.forEach((t) => {
      const key = t.subjectId?.toString();
      if (!key) return;
      if (!subjectMap[key]) subjectMap[key] = { subjectId: t.subjectId, subjectName: t.subjectName, tasks: [] };
      subjectMap[key].tasks.push(t);
    });

    Object.values(subjectMap).forEach(({ subjectId, subjectName, tasks }) => {
      const sDone = tasks.filter((t) => t.status === "completed");
      const sMarks = sDone.filter((t) => typeof t.marks === "number");
      snapshotsToSave.push({
        studentId,
        snapshotScope: "subject",
        ...baseContext,
        subjectId,
        subjectName,
        totalTasks: tasks.length,
        completedTasks: sDone.length,
        pendingTasks: tasks.filter((t) => t.status === "pending").length,
        inProgressTasks: tasks.filter((t) => t.status === "inProgress").length,
        averageMarks: sMarks.length > 0
          ? Number((sMarks.reduce((s, t) => s + t.marks, 0) / sMarks.length).toFixed(2))
          : 0,
        changedBy: actorUser?.id || actorUser?._id || null,
        changedByName: actorUser?.name || "",
        changedByRole: actorUser?.role || "",
        changedAt: new Date(),
      });
    });

    await StudentProgressSnapshot.insertMany(snapshotsToSave);
  } catch (snapErr) {
    console.error("Promotion snapshot failed:", snapErr.message);
  }

  student.currentLevelId = targetLevelId;
  student.currentSubLevelId = nextSubLevel._id;
  student.syllabusVersionId = newSyllabus._id;
  student.sessionId = latestSession._id;
  await student.save();

  // Auto-assign tasks for new sublevel
  let tasksAssigned = 0;
  try {
    const result = await assignTasksToStudent(student._id, newSyllabus._id);
    tasksAssigned = result.totalTasks;
  } catch (err) {
    console.error("Task assignment after promotion failed:", err.message);
  }

  // 📸 Save promotion snapshot — clearly marks when & where student was promoted
  try {
    const [newLevelDoc, newSubLevelDoc, newSessionDoc, newSyllabusDoc] = await Promise.all([
      Level.findById(targetLevelId).select("name"),
      SubLevel.findById(nextSubLevel._id).select("name"),
      Session.findById(latestSession._id).select("name"),
      SyllabusVersion.findById(newSyllabus._id).select("title version"),
    ]);

    await StudentProgressSnapshot.create({
      studentId,
      snapshotScope: "promotion",
      sessionId: latestSession._id,
      sessionName: newSessionDoc?.name || "",
      levelId: targetLevelId,
      levelName: newLevelDoc?.name || "",
      subLevelId: nextSubLevel._id,
      subLevelName: newSubLevelDoc?.name || "",
      syllabusVersionId: newSyllabus._id,
      syllabusVersionTitle: newSyllabusDoc?.title || "",
      syllabusVersionCode: newSyllabusDoc?.version || "",
      subjectId: null,
      subjectName: "",
      totalTasks: tasksAssigned,
      completedTasks: 0,
      pendingTasks: tasksAssigned,
      inProgressTasks: 0,
      averageMarks: 0,
      changedBy: actorUser?.id || actorUser?._id || null,
      changedByName: actorUser?.name || "",
      changedByRole: actorUser?.role || "",
      changedAt: new Date(),
    });
  } catch (snapErr) {
    console.error("Promotion entry snapshot failed:", snapErr.message);
  }

  // Log the promotion event
  await StudentEventLog.create({
    studentId,
    type: "promotion",
    action: isAuto ? "auto_promoted" : "manual_promoted",
    title: `Promoted to ${promotedToNewLevel ? "new level" : "next sub-level"}`,
    description: `Student moved from SubLevel ${prevSubLevelId} to ${nextSubLevel._id}`,
    meta: {
      prevLevelId,
      prevSubLevelId,
      prevSyllabusVersionId,
      newLevelId: targetLevelId,
      newSubLevelId: nextSubLevel._id,
      newSyllabusVersionId: newSyllabus._id,
      promotedToNewLevel,
      tasksAssigned,
      isAuto,
    },
    createdBy: actorUser?.id || actorUser?._id || null,
    createdByName: actorUser?.name || "",
    createdByRole: actorUser?.role || "",
  });

  return {
    promotedToNewLevel,
    newLevelId: targetLevelId,
    newSubLevelId: nextSubLevel._id,
    newSyllabusVersionId: newSyllabus._id,
    tasksAssigned,
    isAuto,
  };
};

module.exports = { syncStudentReadiness, promoteToNextSubLevel };
