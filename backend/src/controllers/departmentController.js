const Department = require("../models/Department");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinaryConfig");

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

const generateDeptCode = async (name) => {
  const words = name.trim().split(/\s+/);
  const initials = words.length === 1
    ? words[0].slice(0, 3).toUpperCase()
    : words.map(w => w[0].toUpperCase()).join("");

  // Check ALL documents (including soft-deleted) to avoid unique index conflict
  if (!await Department.exists({ code: initials })) return initials;

  let counter = 1;
  while (true) {
    const code = `${initials}${String(counter).padStart(3, "0")}`;
    if (!await Department.exists({ code })) return code;
    counter++;
  }
};

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, universityName, reportConfig, allowedCourses } = req.body;

    if (!name || !universityName || !reportConfig) {
      return res.status(400).json({
        success: false,
        message: "Name, universityName, and reportConfig are required"
      });
    }

    const autoCode = await generateDeptCode(name);

    // Validate reportConfig
    if (!validateReportConfig(reportConfig)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reportConfig structure"
      });
    }

    if (allowedCourses && !validateAllowedCourses(allowedCourses)) {
      return res.status(400).json({
        success: false,
        message: "Invalid allowedCourses structure"
      });
    }

    let logoUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "department_logos", resource_type: "image" },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(req.file.buffer);
      });
      logoUrl = result.secure_url;
    }

    const { code: _ignored, ...bodyWithoutCode } = req.body;
    const departmentData = {
      ...bodyWithoutCode,
      code: autoCode
    };

    if (logoUrl) departmentData.logo = logoUrl;

    const department = await Department.create(departmentData);
    console.log(`✅ Department created with code: ${department}`);
    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department
    });

  } catch (error) {
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

    let updateData = { ...req.body };
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "department_logos", resource_type: "image" },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(req.file.buffer);
      });
      updateData.logo = result.secure_url;
    }

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      updateData,
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