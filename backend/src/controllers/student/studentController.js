const Student = require("../../models/student/Student");
const StudentTask = require("../../models/syllabus/StudentTask");
const StudentProgressSnapshot = require("../../models/student/StudentProgressSnapshot");
const StudentTaskHistory = require("../../models/student/StudentTaskHistory");
const SubDepartment = require("../../models/department/SubDepartment");
const Level = require("../../models/department/Level");
const SubLevel = require("../../models/department/SubLevel");
const Session = require("../../models/Session");
const SyllabusVersion = require("../../models/syllabus/SyllabusVersion");
const { assignTasksToStudent } = require("../../services/taskAssignmentService");
const { promoteToNextSubLevel } = require("../../services/studentService");
const cloudinary = require("../../config/cloudinaryConfig");
const mongoose = require("mongoose");


// ✅ Create Student
exports.createStudent = async (req, res) => {




 
  try {
    const { subDepartmentId } = req.body;


    // Duplicate check
    const existing = await Student.findOne({ prkey: req.body.prkey });
    if (existing) return res.status(409).json({ message: "Student with this prkey already exists" });


    // Validate subDepartment
    const subDept = await SubDepartment.findById(subDepartmentId);
    if (!subDept) return res.status(404).json({ message: "SubDepartment not found" });


    // 1️⃣ First Level (lowest order) under this subDepartment
    const firstLevel = await Level.findOne({ subDepartmentId, isActive: true }).sort({ order: 1 });
    if (!firstLevel) return res.status(404).json({ message: "No active level found for this subDepartment" });


    // 2️⃣ First SubLevel (lowest order) under that Level
    const firstSubLevel = await SubLevel.findOne({ levelId: firstLevel._id, isActive: true }).sort({ order: 1 });
    if (!firstSubLevel) return res.status(404).json({ message: "No active sub-level found for this level" });


    // 3️⃣ Latest active Session
    const latestSession = await Session.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!latestSession) return res.status(404).json({ message: "No active session found" });


    // 4️⃣ Latest active SyllabusVersion for this session + level + sublevel
    const latestSyllabus = await SyllabusVersion.findOne({
      sessionId: latestSession._id,
      levelId: firstLevel._id,
      subLevelId: firstSubLevel._id,
      status: "active",
      isActive: true
    }).sort({ createdAt: -1 });
    if (!latestSyllabus) return res.status(404).json({ message: "No active syllabus version found for this session/level/sublevel" });


    const student = new Student({
      ...req.body,
      sessionId: latestSession._id,
      currentLevelId: firstLevel._id,
      currentSubLevelId: firstSubLevel._id,
      syllabusVersionId: latestSyllabus._id
    });


    await student.save();


    // 5️⃣ Auto-assign tasks of this syllabus version to the student
    let taskAssignmentResult = null;
    try {
      taskAssignmentResult = await assignTasksToStudent(student._id, latestSyllabus._id);
    } catch (taskErr) {
      // Task assignment failure should not block student creation
      console.error("Task auto-assignment failed:", taskErr.message);
    }


    return res.status(201).json({
      message: "Student created successfully",
      data: student,
      meta: {
        sessionName: latestSession.name,
        levelName: firstLevel.name,
        subLevelName: firstSubLevel.name,
        syllabusVersion: latestSyllabus.version,
        tasksAssigned: taskAssignmentResult ? taskAssignmentResult.totalTasks : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get All Students (with department-based access control)
exports.getAllStudents = async (req, res) => {
  try {
    const { sessionId, currentLevelId, currentSubLevelId, status } = req.query;

    // req.subDeptFilter is set by departmentFilter middleware
    // null = no restriction (admin/superadmin), object = restricted to allowed subDepts
    const filter = req.subDeptFilter ? { ...req.subDeptFilter } : {};

    if (sessionId) filter.sessionId = sessionId;
    if (currentLevelId) filter.currentLevelId = currentLevelId;
    if (currentSubLevelId) filter.currentSubLevelId = currentSubLevelId;
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate("subDepartmentId", "name departmentId")
      .populate("sessionId", "name")
      .populate("currentLevelId", "name order")
      .populate("currentSubLevelId", "name order")
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: students.length, data: students });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("subDepartmentId", "name")
      .populate("sessionId", "name")
      .populate("syllabusVersionId", "version title")
      .populate("currentLevelId", "name order")
      .populate("currentSubLevelId", "name order");


    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(200).json({ data: student });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Update Student Basic Info
exports.updateStudent = async (req, res) => {
  try {
    const allowedFields = [
      "firstName", "lastName", "fatherName", "email", "studentMobile",
      "parentMobile", "gender", "dob", "aadharCard", "address", "track",
      "village", "stream", "course", "category", "subject12", "year12",
      "percent12", "percent10", "status", "isFTP"
    ];
    const updateData = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });


    const student = await Student.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(200).json({ message: "Student updated successfully", data: student });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Update Profile Image
exports.updateProfileImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "Image is required" });
    if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(image))
      return res.status(400).json({ message: "Invalid image format. Must be base64 encoded." });


    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });


    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });


    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "student_profiles",
      public_id: `student_${req.params.id}`,
      overwrite: true,
    });


    student.image = uploadResponse.secure_url;
    await student.save();
    return res.status(200).json({ message: "Profile image updated successfully", imageURL: student.image });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Upload Document (image or pdf)
exports.uploadDocument = async (req, res) => {
  try {
    const { title, fileData, fileType } = req.body;
    if (!title || !fileData || !fileType)
      return res.status(400).json({ message: "title, fileData, and fileType are required" });
    if (!["image", "pdf"].includes(fileType))
      return res.status(400).json({ message: "fileType must be 'image' or 'pdf'" });


    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });


    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });


    const uploadOptions = {
      folder: "student_documents",
      resource_type: fileType === "pdf" ? "raw" : "image",
      public_id: `doc_${req.params.id}_${Date.now()}`,
    };


    const uploadResponse = await cloudinary.uploader.upload(fileData, uploadOptions);


    const doc = {
      title,
      fileURL: uploadResponse.secure_url,
      fileType,
      uploadedBy: req.user?._id || null,
      uploadedByName: req.user?.name || "",
      uploadedAt: new Date(),
    };


    student.documents.push(doc);
    await student.save();


    return res.status(201).json({ message: "Document uploaded successfully", data: doc });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });


    const docIndex = student.documents.findIndex(d => d._id.toString() === req.params.docId);
    if (docIndex === -1) return res.status(404).json({ message: "Document not found" });


    student.documents.splice(docIndex, 1);
    await student.save();
    return res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Update Permission Details
exports.updatePermission = async (req, res) => {
  try {
    const { imageURL, remark, approved_by } = req.body;
    if (!imageURL || !approved_by) return res.status(400).json({ message: "imageURL and approved_by are required" });
    if (!["super admin", "admin", "faculty"].includes(approved_by))
      return res.status(400).json({ message: "Invalid approved_by role" });


    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });


    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });


    const uploadResponse = await cloudinary.uploader.upload(imageURL, { folder: "permission_applications" });


    student.permissionDetails = {
      imageURL: uploadResponse.secure_url,
      remark: remark || "",
      approved_by,
      uploadDate: new Date(),
    };
    await student.save();
    return res.status(200).json({ message: "Permission updated successfully", data: student.permissionDetails });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Students with Permission (filterable by status)
exports.getPermissionStudents = async (req, res) => {
  try {
    const { status = "pending" } = req.query;
    const validStatuses = ["pending", "approved", "rejected"];
    const statusFilter = validStatuses.includes(status) ? status : "pending";

    const filter = req.subDeptFilter ? { ...req.subDeptFilter } : {};
    filter["permissionDetails"] = { $ne: null };
    filter["permissionDetails.status"] = statusFilter;

    const students = await Student.find(filter)
      .select("prkey firstName lastName email studentMobile permissionDetails currentLevelId currentSubLevelId subDepartmentId")
      .populate("currentLevelId", "name")
      .populate("currentSubLevelId", "name")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ count: students.length, data: students });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Approve or Reject Permission (dummy student workflow)
exports.updatePermissionStatus = async (req, res) => {
  try {
    const { status, remark } = req.body;
    const validStatuses = ["approved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.permissionDetails) {
      return res.status(400).json({ message: "No permission request found for this student" });
    }

    student.permissionDetails.status = status;
    if (remark !== undefined) student.permissionDetails.remark = remark;
    await student.save();

    return res.status(200).json({
      message: `Permission ${status} successfully`,
      data: student.permissionDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Student Tasks (level-wise / sublevel-wise)
exports.getStudentTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { subLevelId, status } = req.query;


    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });


    const filter = {
      studentId: id,
      syllabusVersionId: student.syllabusVersionId,
    };
    if (subLevelId) filter.subLevelId = subLevelId;
    if (status) filter.status = status;


    const tasks = await StudentTask.find(filter).sort({ subjectName: 1, topicName: 1 });


    // Group by subject
    const grouped = {};
    tasks.forEach(t => {
      const key = t.subjectName || "Other";
      if (!grouped[key]) grouped[key] = { subjectId: t.subjectId, tasks: [] };
      grouped[key].tasks.push(t);
    });


    return res.status(200).json({
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === "completed").length,
      pendingTasks: tasks.filter(t => t.status === "pending").length,
      inProgressTasks: tasks.filter(t => t.status === "inProgress").length,
      groupedBySubject: grouped,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Student Tasks by SubLevel
exports.getStudentTasksBySubLevel = async (req, res) => {
  try {
    const { id, subLevelId } = req.params;


    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: "Student not found" });


    const tasks = await StudentTask.find({
      studentId: id,
      subLevelId,
      syllabusVersionId: student.syllabusVersionId,
    }).sort({ subjectName: 1, topicName: 1 });


    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === "completed").length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "inProgress").length,
      averageMarks: 0,
    };


    const completedWithMarks = tasks.filter(t => t.status === "completed" && t.marks !== null);
    if (completedWithMarks.length > 0) {
      stats.averageMarks = parseFloat(
        (completedWithMarks.reduce((sum, t) => sum + t.marks, 0) / completedWithMarks.length).toFixed(2)
      );
    }


    return res.status(200).json({ stats, tasks });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Student Task History
exports.getStudentTaskHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId, subLevelId, page = 1, limit = 20 } = req.query;


    const filter = { studentId: id };
    if (taskId) filter.taskId = taskId;
    if (subLevelId) filter.subLevelId = subLevelId;


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [history, total] = await Promise.all([
      StudentTaskHistory.find(filter).sort({ changedAt: -1 }).skip(skip).limit(parseInt(limit)),
      StudentTaskHistory.countDocuments(filter),
    ]);


    return res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: history,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Student Progress Snapshots
exports.getStudentProgressSnapshots = async (req, res) => {
  try {
    const { id } = req.params;
    const { subLevelId, scope, page = 1, limit = 20 } = req.query;


    const filter = { studentId: id };
    if (subLevelId) filter.subLevelId = subLevelId;
    if (scope) filter.snapshotScope = scope;


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [snapshots, total] = await Promise.all([
      StudentProgressSnapshot.find(filter).sort({ changedAt: -1 }).skip(skip).limit(parseInt(limit)),
      StudentProgressSnapshot.countDocuments(filter),
    ]);


    return res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: snapshots,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Promote Student to Next SubLevel (Manual or Auto-triggered)
exports.promoteStudent = async (req, res) => {
  try {
    const result = await promoteToNextSubLevel(req.params.id, req.user);
    return res.status(200).json({
      message: result.promotedToNewLevel
        ? "Student promoted to next level"
        : "Student promoted to next sub-level",
      data: result,
    });
  } catch (error) {
    const status = error.message.includes("not found") ? 404
      : error.message.includes("already completed") ? 400
      : error.message.includes("Only active") ? 400
      : 500;
    return res.status(status).json({ message: error.message });
  }
};


// ✅ Update Readiness Status
exports.updateReadinessStatus = async (req, res) => {
  try {
    const { readinessStatus } = req.body;
    const validStatuses = ["Ready", "Not Ready", "In Progress", "Ready for Interview"];
    if (!readinessStatus || !validStatuses.includes(readinessStatus))
      return res.status(400).json({ message: `readinessStatus must be one of: ${validStatuses.join(", ")}` });


    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { readinessStatus },
      { new: true, runValidators: true }
    ).select("_id prkey firstName lastName readinessStatus");


    if (!student) return res.status(404).json({ message: "Student not found" });
    return res.status(200).json({ message: "Readiness status updated", data: student });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Student Dashboard Stats (department-aware)
exports.getStudentStats = async (req, res) => {
  try {
    const base = req.subDeptFilter ? { ...req.subDeptFilter } : {};

    const [total, active, placed, dropped] = await Promise.all([
      Student.countDocuments(base),
      Student.countDocuments({ ...base, status: "Active" }),
      Student.countDocuments({ ...base, status: "Placed" }),
      Student.countDocuments({ ...base, status: "Dropped" }),
    ]);
    return res.status(200).json({ total, active, placed, dropped });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};