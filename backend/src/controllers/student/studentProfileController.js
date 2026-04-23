const Student = require("../../models/student/Student");
const cloudinary = require("../../config/cloudinaryConfig");
const {
  getStudentTasks,
  getStudentTaskSummary,
  updateStudentTaskStatus
} = require("../../services/taskAssignmentService");
const { getStudentProfilePayload, getResolvedSyllabusVersionId, groupDocuments } = require("../../services/studentProfileService");

exports.getStudentProfile = async (req, res) => {
  try {
    const payload = await getStudentProfilePayload(
      req.params.studentId,
      req.query.syllabusVersionId
    );

    res.status(200).json({
      success: true,
      data: payload
    });
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateStudentBasicProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "fatherName",
      "email",
      "studentMobile",
      "parentMobile",
      "gender",
      "dob",
      "aadharCard",
      "address",
      "village",
      "category",
      "stream",
      "subject12",
      "year12",
      "percent12",
      "percent10",
      "selectedCourse",
      "techno",
      "profileRemark",
      "isFTP",
      "status"
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      updateData,
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
      message: "Student profile updated successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateStudentEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const existingStudent = await Student.findOne({
      email,
      _id: { $ne: req.params.studentId }
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Email already exists for another student"
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { email },
      { new: true, runValidators: true }
    ).select("_id firstName lastName email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student email updated successfully",
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStudentDocuments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select("documents profileImageDocumentId resumeDocumentId image");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json({
      success: true,
      data: groupDocuments(student.documents || [])
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadStudentDocument = async (req, res) => {
  try {
    const { category = "extra", label, fileData, fileName, mimeType, remark } = req.body;
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    if (!label || !fileData) {
      return res.status(400).json({
        success: false,
        message: "label and fileData are required"
      });
    }

    const uploadedBy = req.user?.id || req.user?._id || null;
    const uploadedByName = req.user?.name || "";
    const uploadedByRole = req.user?.role || "";

    const resourceType = category === "profileImage" ? "image" : "auto";
    const uploadResult = await cloudinary.uploader.upload(fileData, {
      folder: `students/${req.params.studentId}/${category}`,
      resource_type: resourceType
    });

    const documentEntry = {
      category,
      label,
      fileName: fileName || "",
      mimeType: mimeType || "",
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadedBy,
      uploadedByName,
      uploadedByRole,
      remark: remark || "",
      uploadedAt: new Date(),
      isActive: true
    };

    student.documents.push(documentEntry);
    const createdDocument = student.documents[student.documents.length - 1];

    if (category === "profileImage") {
      student.profileImageDocumentId = createdDocument._id;
      student.image = createdDocument.url;
    }

    if (category === "resume") {
      student.resumeDocumentId = createdDocument._id;
    }

    student.eventHistory.push({
      type: "document",
      action: "document_uploaded",
      title: `${category} uploaded`,
      description: `${label} uploaded successfully`,
      meta: {
        documentId: createdDocument._id,
        category,
        url: createdDocument.url
      },
      createdBy: uploadedBy,
      createdByName: uploadedByName,
      createdByRole: uploadedByRole,
      createdAt: new Date()
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: createdDocument
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deactivateStudentDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const document = student.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    document.isActive = false;

    if (student.profileImageDocumentId?.toString() === document._id.toString()) {
      student.profileImageDocumentId = null;
    }

    if (student.resumeDocumentId?.toString() === document._id.toString()) {
      student.resumeDocumentId = null;
    }

    student.eventHistory.push({
      type: "document",
      action: "document_deactivated",
      title: "Document removed",
      description: `${document.label} marked inactive`,
      meta: {
        documentId: document._id,
        category: document.category
      },
      createdBy: req.user?.id || req.user?._id || null,
      createdByName: req.user?.name || "",
      createdByRole: req.user?.role || "",
      createdAt: new Date()
    });

    await student.save();

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStudentProfileTasks = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select("syllabusVersionId");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const syllabusVersionId = getResolvedSyllabusVersionId(student, req.query.syllabusVersionId);
    if (!syllabusVersionId) {
      return res.status(400).json({
        success: false,
        message: "syllabusVersionId is required or student must have one assigned"
      });
    }

    const tasks = await getStudentTasks(student._id, syllabusVersionId, {
      status: req.query.status,
      subjectId: req.query.subjectId,
      topicId: req.query.topicId,
      subTopicId: req.query.subTopicId
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

exports.getStudentProfileTaskSummary = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select("syllabusVersionId");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const syllabusVersionId = getResolvedSyllabusVersionId(student, req.query.syllabusVersionId);
    if (!syllabusVersionId) {
      return res.status(400).json({
        success: false,
        message: "syllabusVersionId is required or student must have one assigned"
      });
    }

    const summary = await getStudentTaskSummary(student._id, syllabusVersionId);

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

exports.updateStudentProfileTaskStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select("_id");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const { status, marks, notes } = req.body;
    if (!status && marks === undefined && notes === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one of status, marks or notes is required"
      });
    }

    const task = await updateStudentTaskStatus(student._id, req.params.taskId, {
      status,
      marks,
      notes,
      actor: req.user
    });

    res.status(200).json({
      success: true,
      message: "Student task status updated successfully",
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
