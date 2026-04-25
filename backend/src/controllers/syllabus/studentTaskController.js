const {
  getStudentTasks,
  getStudentTaskSummary,
  updateStudentTaskStatus
} = require("../../services/taskAssignmentService");

exports.getStudentTasks = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { syllabusVersionId, status, subjectId, topicId, subTopicId } = req.query;

    if (!syllabusVersionId) {
      return res.status(400).json({
        success: false,
        message: "syllabusVersionId is required"
      });
    }

    const tasks = await getStudentTasks(studentId, syllabusVersionId, {
      status,
      subjectId,
      topicId,
      subTopicId
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStudentTaskSummary = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { syllabusVersionId } = req.query;

    if (!syllabusVersionId) {
      return res.status(400).json({
        success: false,
        message: "syllabusVersionId is required"
      });
    }

    const summary = await getStudentTaskSummary(studentId, syllabusVersionId);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateStudentTaskStatus = async (req, res) => {
  try {
    const { studentId, taskId } = req.params;
    const { status, marks, notes } = req.body;

    if (!status && marks === undefined && notes === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one of status, marks or notes is required"
      });
    }

    const studentTask = await updateStudentTaskStatus(studentId, taskId, {
      status,
      marks,
      notes,
      actor: req.user
    });

    res.status(200).json({
      success: true,
      message: "Student task updated successfully",
      data: studentTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
