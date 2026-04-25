const Student = require("../models/student/Student");
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
  const [tasks, taskSummary] = syllabusVersionId
    ? await Promise.all([
        getStudentTasks(student._id, syllabusVersionId),
        getStudentTaskSummary(student._id, syllabusVersionId)
      ])
    : [[], null];

  return {
    student,
    syllabusVersionId,
    taskSummary,
    tasks,
    documents: groupDocuments(student.documents || []),
    promotionHistory: student.promotionHistory || [],
    taskSnapshots: (student.taskSnapshots || []).slice().sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)),
    progressSnapshots: (student.progressSnapshots || []).slice().sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)),
    eventHistory: (student.eventHistory || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  };
};

module.exports = {
  getResolvedSyllabusVersionId,
  groupDocuments,
  getStudentProfilePayload
};
