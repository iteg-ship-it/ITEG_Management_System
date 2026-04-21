const Department = require("../../models/department/Department");
const mongoose = require("mongoose");
const cloudinary = require("../../config/cloudinaryConfig");

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
  const initials = name.trim().split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).join("");
  let counter = 1, code, exists = true;
  while (exists) {
    code = `${initials}-${String(counter).padStart(3, "0")}`;
    exists = await Department.exists({ code });
    counter++;
  }
  return code;
};

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, universityName, reportConfig: rawReportConfig, allowedCourses: rawCourses } = req.body;

    if (!name || !universityName || !rawReportConfig) {
      return res.status(400).json({
        success: false,
        message: "Name, universityName, and reportConfig are required"
      });
    }

    const autoCode = await generateDeptCode(name);

    let reportConfig = rawReportConfig;
    if (typeof rawReportConfig === 'string') {
      try { reportConfig = JSON.parse(rawReportConfig); } catch (_) {}
    }
    let allowedCourses = rawCourses;
    if (typeof rawCourses === 'string') {
      try { allowedCourses = JSON.parse(rawCourses); } catch (_) {}
    }
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    }

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

    // 🌩️ Upload Logo
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

    const departmentData = {
      ...req.body,
      reportConfig,
      allowedCourses: allowedCourses || [],
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
    const SubDepartment = require("../../models/department/SubDepartment");
    const Student = require("../../models/Student");

    const departments = await Department.find();

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const subDepts = await SubDepartment.find({ departmentId: dept._id, isActive: true }).select('_id');
        const subDeptIds = subDepts.map(s => s._id);
        const totalStudents = await Student.countDocuments({ subDepartmentId: { $in: subDeptIds } });
        return { ...dept.toObject(), totalStudents };
      })
    );

    res.status(200).json({
      success: true,
      data: departmentsWithCounts
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

    // Handle logo upload if file is provided
    let updateData = { ...req.body };
    if (updateData.allowedCourses && typeof updateData.allowedCourses === 'string') {
      try { updateData.allowedCourses = JSON.parse(updateData.allowedCourses); } catch (_) {}
    }
    if (updateData.reportConfig && typeof updateData.reportConfig === 'string') {
      try { updateData.reportConfig = JSON.parse(updateData.reportConfig); } catch (_) {}
    }
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;

    // Validate after parsing
    if (updateData.reportConfig && !validateReportConfig(updateData.reportConfig)) {
      return res.status(400).json({ success: false, message: "Invalid reportConfig structure." });
    }
    if (updateData.allowedCourses && !validateAllowedCourses(updateData.allowedCourses)) {
      return res.status(400).json({ success: false, message: "Invalid allowedCourses structure." });
    }
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
      { _id: req.params.id },
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