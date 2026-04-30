const mongoose = require("mongoose");

const parseField = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

// Validation middleware for department operations
const validateDepartmentInput = (req, res, next) => {
  const name = req.body.name;
  const universityName = req.body.universityName;
  const reportConfig = parseField(req.body.reportConfig);
  const allowedCourses = parseField(req.body.allowedCourses);

  // Reassign parsed values back so controller gets objects
  if (reportConfig) req.body.reportConfig = reportConfig;
  if (allowedCourses) req.body.allowedCourses = allowedCourses;

  if (req.method === 'POST') {
    if (!name || !universityName || !reportConfig) {
      return res.status(400).json({
        success: false,
        message: "Name, universityName, and reportConfig are required"
      });
    }
  }

  if (reportConfig) {
    const validTemplateTypes = ["ITEG_STANDARD", "MEG_WEIGHTED", "BEG_CUTOFF", "BTECH_STAGE"];
    if (!reportConfig.templateType || !validTemplateTypes.includes(reportConfig.templateType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid templateType. Must be one of: " + validTemplateTypes.join(", ")
      });
    }
    if (!reportConfig.sections || typeof reportConfig.sections !== 'object') {
      return res.status(400).json({
        success: false,
        message: "reportConfig must include sections object"
      });
    }
  }

  if (allowedCourses && Array.isArray(allowedCourses) && allowedCourses.length > 0) {
    // FormData strings ko number mein convert karo
    allowedCourses.forEach(c => {
      if (typeof c.durationInYears === 'string') c.durationInYears = Number(c.durationInYears);
    });
    req.body.allowedCourses = allowedCourses;

    const isValidCourses = allowedCourses.every(course =>
      course.courseName &&
      typeof course.courseName === 'string' &&
      course.durationInYears &&
      typeof course.durationInYears === 'number' &&
      course.durationInYears > 0
    );
    if (!isValidCourses) {
      return res.status(400).json({
        success: false,
        message: "Each course must have courseName (string) and durationInYears (positive number)"
      });
    }
  }

  next();
};

// Validation middleware for ObjectId parameters
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
  }
  
  next();
};

module.exports = {
  validateDepartmentInput,
  validateObjectId
};