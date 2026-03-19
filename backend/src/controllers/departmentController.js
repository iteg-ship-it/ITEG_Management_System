const Department = require("../models/Department");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Helper function to validate allowedCourses structure
const validateAllowedCourses = (courses) => {
  if (!Array.isArray(courses)) return false;
  return courses.every(course => 
    course.courseName && 
    typeof course.courseName === 'string' &&
    course.durationInYears && 
    typeof course.durationInYears === 'number' &&
    course.durationInYears > 0
  );
};

// Helper function to validate reportConfig structure
const validateReportConfig = (reportConfig) => {
  if (!reportConfig || typeof reportConfig !== 'object') return false;
  
  const validTemplateTypes = ["ITEG_STANDARD", "MEG_WEIGHTED", "BEG_CUTOFF", "BTECH_STAGE"];
  if (!reportConfig.templateType || !validTemplateTypes.includes(reportConfig.templateType)) {
    return false;
  }
  
  if (!reportConfig.sections || typeof reportConfig.sections !== 'object') {
    return false;
  }
  
  return true;
};

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    // Validate required fields
    const { name, code, universityName, reportConfig, allowedCourses } = req.body;
    if (!name || !code || !universityName || !reportConfig) {
      return res.status(400).json({
        success: false,
        message: "Name, code, universityName, and reportConfig are required"
      });
    }

    // Validate reportConfig structure
    if (!validateReportConfig(reportConfig)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reportConfig structure. Must include templateType and sections."
      });
    }

    // Validate allowedCourses if provided
    if (allowedCourses && !validateAllowedCourses(allowedCourses)) {
      return res.status(400).json({
        success: false,
        message: "Invalid allowedCourses structure. Each course must have courseName (string) and durationInYears (positive number)."
      });
    }

    // Handle logo upload if file is provided
    let logoUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "department_logos",
        resource_type: "image"
      });
      logoUrl = result.secure_url;
    }

    const departmentData = { ...req.body };
    if (logoUrl) departmentData.logo = logoUrl;

    const department = await Department.create(departmentData);
    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department code already exists"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format"
      });
    }

    const department = await Department.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format"
      });
    }

    // Validate reportConfig if provided
    if (req.body.reportConfig && !validateReportConfig(req.body.reportConfig)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reportConfig structure. Must include templateType and sections."
      });
    }

    // Validate allowedCourses if provided
    if (req.body.allowedCourses && !validateAllowedCourses(req.body.allowedCourses)) {
      return res.status(400).json({
        success: false,
        message: "Invalid allowedCourses structure. Each course must have courseName (string) and durationInYears (positive number)."
      });
    }

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department code already exists"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Department (soft delete)
exports.deleteDepartment = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID format"
      });
    }

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Department deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};