const Student = require("../models/student/Student");
const Level = require("../models/department/Level");
const SubLevel = require("../models/department/SubLevel");
const SyllabusVersion = require("../models/syllabus/SyllabusVersion");
const { assignTasksToStudent } = require("./taskAssignmentService");
const { sendEmail } = require("../controllers/helper/emailController");
const { syncStudentReadiness } = require("./studentService");

const getStudentWithProgression = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate("currentLevelId", "name order subDepartmentId")
    .populate("currentSubLevelId", "name order levelId")
    .populate("subDepartmentId", "name");

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
};

const getNextPromotionTarget = async (student) => {
  const currentLevelId = student.currentLevelId?._id || student.currentLevelId;
  const currentSubLevelId = student.currentSubLevelId?._id || student.currentSubLevelId;
  const currentLevelOrder = student.currentLevelId?.order;
  const currentSubLevelOrder = student.currentSubLevelId?.order;
  const subDepartmentId = student.subDepartmentId?._id || student.subDepartmentId || student.currentLevelId?.subDepartmentId;

  const nextSubLevel = await SubLevel.findOne({
    levelId: currentLevelId,
    order: { $gt: currentSubLevelOrder },
    isActive: true
  }).sort({ order: 1 });

  if (nextSubLevel) {
    return {
      levelId: currentLevelId,
      subLevelId: nextSubLevel._id,
      transitionType: "subLevel"
    };
  }

  const nextLevel = await Level.findOne({
    subDepartmentId,
    order: { $gt: currentLevelOrder },
    isActive: true
  }).sort({ order: 1 });

  if (!nextLevel) {
    throw new Error("Student is already at the final promotion stage");
  }

  const firstSubLevelOfNextLevel = await SubLevel.findOne({
    levelId: nextLevel._id,
    isActive: true
  }).sort({ order: 1 });

  if (!firstSubLevelOfNextLevel) {
    throw new Error("Next level does not have any active sublevels");
  }

  return {
    levelId: nextLevel._id,
    subLevelId: firstSubLevelOfNextLevel._id,
    transitionType: "level"
  };
};

const getPromotionPreview = async (studentId) => {
  const student = await getStudentWithProgression(studentId);
  const nextTarget = await getNextPromotionTarget(student);

  const [nextLevel, nextSubLevel, nextSyllabus] = await Promise.all([
    Level.findById(nextTarget.levelId).select("name order"),
    SubLevel.findById(nextTarget.subLevelId).select("name order"),
    SyllabusVersion.findOne({
      sessionId: student.sessionId,
      levelId: nextTarget.levelId,
      subLevelId: nextTarget.subLevelId,
      status: "active",
      isActive: true
    }).select("title version status")
  ]);

  return {
    student: {
      _id: student._id,
      firstName: student.firstName,
      lastName: student.lastName,
      currentLevelId: student.currentLevelId,
      currentSubLevelId: student.currentSubLevelId
    },
    next: {
      level: nextLevel,
      subLevel: nextSubLevel,
      syllabusVersion: nextSyllabus,
      transitionType: nextTarget.transitionType
    }
  };
};

const promoteStudent = async (studentId, promotedBy, remark = "") => {
  const student = await getStudentWithProgression(studentId);
  const nextTarget = await getNextPromotionTarget(student);

  const nextSyllabus = await SyllabusVersion.findOne({
    sessionId: student.sessionId,
    levelId: nextTarget.levelId,
    subLevelId: nextTarget.subLevelId,
    status: "active",
    isActive: true
  }).select("_id title version status");

  if (!nextSyllabus) {
    throw new Error("No active syllabus found for the next level/sublevel");
  }

  const fromLevelId = student.currentLevelId?._id || student.currentLevelId;
  const fromSubLevelId = student.currentSubLevelId?._id || student.currentSubLevelId;
  const previousSyllabusVersionId = student.syllabusVersionId || null;

  student.currentLevelId = nextTarget.levelId;
  student.currentSubLevelId = nextTarget.subLevelId;
  student.syllabusVersionId = nextSyllabus._id;
  student.promotionHistory.push({
    fromLevelId,
    fromSubLevelId,
    toLevelId: nextTarget.levelId,
    toSubLevelId: nextTarget.subLevelId,
    promotedBy: promotedBy._id,
    promotedByName: promotedBy.name || "",
    promotedByRole: promotedBy.role || "",
    remark: remark || ""
  });

  try {
    await student.save();
    const assignmentResult = await assignTasksToStudent(student._id, nextSyllabus._id);
    const [level, subLevel] = await Promise.all([
      Level.findById(nextTarget.levelId).select("name order"),
      SubLevel.findById(nextTarget.subLevelId).select("name order")
    ]);

    const lastPromotion = student.promotionHistory[student.promotionHistory.length - 1];

    await Student.findByIdAndUpdate(student._id, {
      $push: {
        eventHistory: {
          type: "promotion",
          action: "student_promoted",
          title: "Student promoted",
          description: `Promoted to ${level?.name || "next level"} / ${subLevel?.name || "next sublevel"}`,
          meta: {
            toLevelId: nextTarget.levelId,
            toSubLevelId: nextTarget.subLevelId,
            syllabusVersionId: nextSyllabus._id,
            transitionType: nextTarget.transitionType
          },
          createdBy: promotedBy._id,
          createdByName: promotedBy.name || "",
          createdByRole: promotedBy.role || "",
          createdAt: new Date()
        }
      }
    });

    if (student.email) {
      await sendEmail({
        to: student.email,
        subject: "Congratulations on Your Promotion",
        text: `Hi ${student.firstName || "Student"},\n\nCongratulations! You have been promoted to ${level?.name || "the next level"} - ${subLevel?.name || "the next sublevel"}.\n\nKeep up the good work.\n\nRegards,\nITEG Management System`
      });

      await Student.findByIdAndUpdate(student._id, {
        $push: {
          eventHistory: {
            type: "email",
            action: "promotion_congratulation_email_sent",
            title: "Promotion email sent",
            description: `Congratulation email sent for ${level?.name || "promotion"} / ${subLevel?.name || "promotion"}`,
            meta: {
              email: student.email,
              toLevelId: nextTarget.levelId,
              toSubLevelId: nextTarget.subLevelId
            },
            createdBy: promotedBy._id,
            createdByName: promotedBy.name || "",
            createdByRole: promotedBy.role || "",
            createdAt: new Date()
          }
        }
      });
    }

    await syncStudentReadiness(student._id);

    return {
      studentId: student._id,
      promotedTo: {
        level,
        subLevel,
        syllabusVersion: nextSyllabus
      },
      assignment: assignmentResult,
      lastPromotion
    };
  } catch (error) {
    student.currentLevelId = fromLevelId;
    student.currentSubLevelId = fromSubLevelId;
    student.syllabusVersionId = previousSyllabusVersionId;
    student.promotionHistory.pop();
    await student.save();
    throw error;
  }
};

const getPromotionHistory = async (studentId) => {
  const student = await Student.findById(studentId)
    .populate("promotionHistory.fromLevelId", "name order")
    .populate("promotionHistory.fromSubLevelId", "name order")
    .populate("promotionHistory.toLevelId", "name order")
    .populate("promotionHistory.toSubLevelId", "name order")
    .populate("promotionHistory.promotedBy", "name email role");

  if (!student) {
    throw new Error("Student not found");
  }

  return student.promotionHistory;
};

module.exports = {
  getPromotionPreview,
  promoteStudent,
  getPromotionHistory
};
