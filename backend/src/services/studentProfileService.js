const Student = require("../models/student/Student");
const StudentTaskHistory = require("../models/student/StudentTaskHistory");
const StudentProgressSnapshot = require("../models/student/StudentProgressSnapshot");
const StudentEventLog = require("../models/student/StudentEventLog");
const { getStudentTasks, getStudentTaskSummary } = require("./taskAssignmentService");

const getResolvedSyllabusVersionId = (student, requestedSyllabusVersionId) =>
  requestedSyllabusVersionId || student.syllabusVersionId?.toString() || null;

const groupDocuments = (documents = []) => {
  const activeDocuments = documents.filter((doc) => doc.isActive !== false);

  return {
    profileImage: activeDocuments.find((doc) => doc.category === "profileImage") || null,
    resume: activeDocuments.find((doc) => doc.category === "resume") || null,
    extras: activeDocuments.filter((doc) => doc.category === "extra"),
    milestones: activeDocuments.filter((doc) => doc.category === "milestone"),
    placement: activeDocuments.filter((doc) => doc.category === "placement"),
    all: activeDocuments
  };
};

const getStudentProfilePayload = async (studentId, requestedSyllabusVersionId) => {
  const student = await Student.findById(studentId)
    .populate("subDepartmentId", "name code")
    .populate("sessionId", "name")
    .populate("currentLevelId", "name order")
    .populate("currentSubLevelId", "name order")
    .populate("syllabusVersionId", "title version status")
    .populate("promotionHistory.fromLevelId", "name order")
    .populate("promotionHistory.fromSubLevelId", "name order")
    .populate("promotionHistory.toLevelId", "name order")
    .populate("promotionHistory.toSubLevelId", "name order")
    .populate("promotionHistory.promotedBy", "name email role");

  if (!student) {
    throw new Error("Student not found");
  }

  const syllabusVersionId = getResolvedSyllabusVersionId(student, requestedSyllabusVersionId);
  const [tasks, taskSummary, taskSnapshots, progressSnapshots, eventHistory] = syllabusVersionId
    ? await Promise.all([
        getStudentTasks(student._id, syllabusVersionId),
        getStudentTaskSummary(student._id, syllabusVersionId),
        StudentTaskHistory.find({ studentId: student._id }).sort({ changedAt: -1 }).lean(),
        StudentProgressSnapshot.find({ studentId: student._id }).sort({ changedAt: -1 }).lean(),
        StudentEventLog.find({ studentId: student._id }).sort({ createdAt: -1 }).lean()
      ])
    : await Promise.all([
        Promise.resolve([]),
        Promise.resolve(null),
        StudentTaskHistory.find({ studentId: student._id }).sort({ changedAt: -1 }).lean(),
        StudentProgressSnapshot.find({ studentId: student._id }).sort({ changedAt: -1 }).lean(),
        StudentEventLog.find({ studentId: student._id }).sort({ createdAt: -1 }).lean()
      ]);

  return {
    student,
    syllabusVersionId,
    taskSummary,
    tasks,
    documents: groupDocuments(student.documents || []),
    promotionHistory: student.promotionHistory || [],
    taskSnapshots,
    progressSnapshots,
    eventHistory
  };
};

module.exports = {
  getResolvedSyllabusVersionId,
  groupDocuments,
  getStudentProfilePayload
};
