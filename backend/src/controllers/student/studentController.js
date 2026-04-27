const Student = require("../../models/student/Student");
const { createStudent, createStudentsBulk, listStudents, getStudentById, syncStudentReadiness } = require("../../services/studentService");

const requiredFields = [
  "prkey",
  "firstName",
  "subDepartmentId",
  "sessionId",
  "currentLevelId",
  "currentSubLevelId",
  "selectedCourse"
];

const validateStudentPayload = (payload = {}) => {
  for (const field of requiredFields) {
    if (!payload[field]) {
      return `${field} is required`;
    }
  }

  return null;
};

exports.createStudent = async (req, res) => {
  try {
    const validationError = validateStudentPayload(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
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

exports.createStudentSingle = exports.createStudent;

exports.createStudentsBulk = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "students must be a non-empty array"
      });
    }

    const validationErrors = students
      .map((payload, index) => {
        const error = validateStudentPayload(payload);
        return error ? { index, message: error } : null;
      })
      .filter(Boolean);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some student records are invalid",
        errors: validationErrors
      });
    }

    const results = await createStudentsBulk(students);
    const successCount = results.filter((item) => item.success).length;
    const failCount = results.filter((item) => !item.success).length;

    res.status(201).json({
      success: true,
      message: `Bulk student upload completed: ${successCount} succeeded, ${failCount} failed`,
      data: results
    });
  } catch (error) {
    res.status(400).json({
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
