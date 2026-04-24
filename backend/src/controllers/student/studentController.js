const Student = require("../../models/student/Student");
const { createStudent, listStudents, getStudentById, syncStudentReadiness } = require("../../services/studentService");

exports.createStudent = async (req, res) => {
  try {
    const requiredFields = [
      "prkey",
      "firstName",
      "subDepartmentId",
      "sessionId",
      "currentLevelId",
      "currentSubLevelId",
      "selectedCourse"
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    const result = await createStudent(req.body);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: result
    });
  } catch (error) {
    const statusCode = error.code === 11000 ? 409 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await listStudents(req.query);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await getStudentById(req.params.studentId);
    const readiness = await syncStudentReadiness(req.params.studentId);

    res.status(200).json({
      success: true,
      data: {
        student,
        readiness
      }
    });
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { status },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student status updated successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.recalculateStudentReadiness = async (req, res) => {
  try {
    const result = await syncStudentReadiness(req.params.studentId);

    res.status(200).json({
      success: true,
      message: "Student readiness recalculated successfully",
      data: result
    });
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
