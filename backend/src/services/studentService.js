const Student = require("../models/student/Student");
const Level = require("../models/department/Level");
const SubLevel = require("../models/department/SubLevel");
const SyllabusVersion = require("../models/syllabus/SyllabusVersion");
const { assignTasksToStudent, getStudentTaskSummary } = require("./taskAssignmentService");

const buildStudentFilters = (query = {}) => {
  const filter = {};

  if (query.sessionId) filter.sessionId = query.sessionId;
  if (query.subDepartmentId) filter.subDepartmentId = query.subDepartmentId;
  if (query.levelId) filter.currentLevelId = query.levelId;
  if (query.subLevelId) filter.currentSubLevelId = query.subLevelId;
  if (query.syllabusVersionId) filter.syllabusVersionId = query.syllabusVersionId;
  if (query.status) filter.status = query.status;
  if (query.readinessStatus) filter.readinessStatus = query.readinessStatus;

  return filter;
};

const populateStudentQuery = (query) =>
  query
    .populate("subDepartmentId", "name")
    .populate("sessionId", "name")
    .populate("currentLevelId", "name order")
    .populate("currentSubLevelId", "name order")
    .populate("syllabusVersionId", "title version status");

const resolveInitialSyllabus = async (studentLike, explicitSyllabusVersionId) => {
  if (explicitSyllabusVersionId) {
    const version = await SyllabusVersion.findOne({
      _id: explicitSyllabusVersionId,
      isActive: true
    });

    if (!version) {
      throw new Error("Provided syllabus version not found");
    }

    return version;
  }

  const activeVersion = await SyllabusVersion.findOne({
    sessionId: studentLike.sessionId,
    levelId: studentLike.currentLevelId,
    subLevelId: studentLike.currentSubLevelId,
    status: "active",
    isActive: true
  }).sort({ createdAt: -1 });

  if (!activeVersion) {
    throw new Error("No active syllabus found for this student's level/sublevel");
  }

  return activeVersion;
};

const getNextProgressionTarget = async (student) => {
  const currentLevel = await Level.findById(student.currentLevelId).select("order subDepartmentId");
  const currentSubLevel = await SubLevel.findById(student.currentSubLevelId).select("order levelId");

  if (!currentLevel || !currentSubLevel) {
    return null;
  }

  const nextSubLevel = await SubLevel.findOne({
    levelId: currentLevel._id,
    order: { $gt: currentSubLevel.order },
    isActive: true
  }).sort({ order: 1 });

  if (nextSubLevel) {
    return { type: "subLevel", levelId: currentLevel._id, subLevelId: nextSubLevel._id };
  }

  const nextLevel = await Level.findOne({
    subDepartmentId: currentLevel.subDepartmentId,
    order: { $gt: currentLevel.order },
    isActive: true
  }).sort({ order: 1 });

  if (!nextLevel) {
    return null;
  }

  const firstSubLevel = await SubLevel.findOne({
    levelId: nextLevel._id,
    isActive: true
  }).sort({ order: 1 });

  if (!firstSubLevel) {
    return null;
  }

  return { type: "level", levelId: nextLevel._id, subLevelId: firstSubLevel._id };
};

const syncStudentReadiness = async (studentId) => {
  const student = await Student.findById(studentId).select("syllabusVersionId readinessStatus readyForPlacementAt currentLevelId currentSubLevelId");
  if (!student) {
    throw new Error("Student not found");
  }

  if (!student.syllabusVersionId) {
    return {
      readinessStatus: student.readinessStatus,
      readyForPlacementAt: student.readyForPlacementAt
    };
  }

  const [summary, nextTarget] = await Promise.all([
    getStudentTaskSummary(student._id, student.syllabusVersionId),
    getNextProgressionTarget(student)
  ]);

  const shouldBeReady = summary.total > 0 && summary.completed === summary.total && !nextTarget;
  const nextReadinessStatus = shouldBeReady ? "ReadyForPlacement" : "NotReady";
  const nextReadyAt = shouldBeReady ? (student.readyForPlacementAt || new Date()) : null;

  await Student.findByIdAndUpdate(student._id, {
    readinessStatus: nextReadinessStatus,
    readyForPlacementAt: nextReadyAt
  });

  return {
    readinessStatus: nextReadinessStatus,
    readyForPlacementAt: nextReadyAt,
    taskSummary: summary,
    nextTarget
  };
};

const createStudent = async (payload) => {
  const syllabusVersion = await resolveInitialSyllabus(payload, payload.syllabusVersionId);

  const student = await Student.create({
    ...payload,
    syllabusVersionId: syllabusVersion._id
  });

  const assignment = await assignTasksToStudent(student._id, syllabusVersion._id);
  await syncStudentReadiness(student._id);

  return {
    student: await populateStudentQuery(Student.findById(student._id)),
    assignment
  };
};

const listStudents = async (query) => {
  const filter = buildStudentFilters(query);
  const students = await populateStudentQuery(
    Student.find(filter).sort({ createdAt: -1 })
  );

  return students;
};

const getStudentById = async (studentId) => {
  const student = await populateStudentQuery(Student.findById(studentId));
  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

module.exports = {
  buildStudentFilters,
  createStudent,
  listStudents,
  getStudentById,
  getNextProgressionTarget,
  syncStudentReadiness
};
