const mongoose = require("mongoose");

// Validation middleware for department operations
const validateDepartmentInput = (req, res, next) => {
  const { name, code, universityName, reportConfig, allowedCourses } = req.body;

  // For POST requests, validate required fields
  if (req.method === 'POST') {
    if (!name || !code || !universityName || !reportConfig) {
      return res.status(400).json({
        success: false,
        message: "Name, code, universityName, and reportConfig are required"
      });
    }
  }

  // Validate reportConfig structure if provided
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

  // Validate allowedCourses structure if provided
  if (allowedCourses) {
    if (!Array.isArray(allowedCourses)) {
      return res.status(400).json({
        success: false,
        message: "allowedCourses must be an array"
      });
    }

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