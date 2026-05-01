const Student = require("../../models/student/Student");
const StudentPlacement = require("../../models/placement/StudentPlacement");
const SubDepartment = require("../../models/department/SubDepartment");
const Company = require("../../models/company/company");
const cloudinary = require("../../config/cloudinaryConfig");

const configCloudinary = () => cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBase64 = async (base64Data, folder, publicId) => {
  configCloudinary();
  const result = await cloudinary.uploader.upload(base64Data, {
    folder, resource_type: "auto", public_id: publicId,
  });
  return result.secure_url;
};

// ── Helper: department/subDepartment filter ──────────────────
const resolveSubDeptFilter = async (query) => {
  const { departmentId, subDepartmentId } = query;
  if (subDepartmentId) return { subDepartmentId };
  if (departmentId) {
    const subDepts = await SubDepartment.find({ departmentId, isActive: true }).select("_id");
    if (subDepts.length === 0) return null;
    return { subDepartmentId: { $in: subDepts.map(s => s._id) } };
  }
  return {};
};

// ── Helper: get or create StudentPlacement ───────────────────
const getOrCreatePlacement = async (studentId) => {
  let placement = await StudentPlacement.findOne({ studentId });
  if (!placement) {
    const student = await Student.findById(studentId).select("subDepartmentId");
    if (!student) throw new Error("Student not found");
    placement = await StudentPlacement.create({ studentId, subDepartmentId: student.subDepartmentId });
  }
  return placement;
};

// ── 0. Get Ready Students (dept/subDept wise) ────────────────
exports.getReadyStudents = async (req, res) => {
  try {
    const deptFilter = await resolveSubDeptFilter(req.query);
    if (deptFilter === null) return res.status(200).json({ message: "Ready students fetched.", data: [] });

    const placements = await StudentPlacement.find({ readinessStatus: "Ready", ...deptFilter })
      .populate("studentId", "firstName lastName course prkey email studentMobile image")
      .sort({ updatedAt: -1 });

    if (placements.length === 0)
      return res.status(404).json({ message: "No students found with readinessStatus 'Ready'." });

    return res.status(200).json({ message: "Ready students fetched successfully.", data: placements });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ── 1. Create / Schedule Interview ──────────────────────────
exports.createInterview = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { companyName, hrEmail, hrContact, location, jobProfile, scheduleDate } = req.body;

    if (!companyName || !hrEmail || !location || !jobProfile || !scheduleDate)
      return res.status(400).json({ message: "Missing required fields: companyName, hrEmail, location, jobProfile, scheduleDate" });

    const placement = await getOrCreatePlacement(studentId);
    if (placement.readinessStatus !== "Ready")
      return res.status(400).json({ message: "Student is not ready for placement" });

    let company = await Company.findOne({ companyName });
    if (!company) {
      company = new Company({ companyName, hrEmail, hrContact: hrContact || "", location });
      await company.save();
    }

    const newInterview = {
      companyRef: company._id,
      jobProfile,
      status: "Scheduled",
      scheduleDate: new Date(scheduleDate),
      rounds: [],
    };

    placement.PlacementinterviewRecord.push(newInterview);
    await placement.save();

    res.status(201).json({ success: true, message: "Interview scheduled successfully", data: { interview: newInterview, company } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 2. Update Interview Status ───────────────────────────────
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { status, rescheduleDate } = req.body;

    const placement = await StudentPlacement.findOne({ studentId });
    if (!placement) return res.status(404).json({ message: "Placement record not found" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = status;
    if (status === "Rescheduled" && rescheduleDate) interview.rescheduleDate = new Date(rescheduleDate);

    await placement.save();
    res.json({ success: true, message: "Interview status updated", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 3. Add Interview Round ───────────────────────────────────
exports.addInterviewRound = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { roundName, date, mode, feedback, result } = req.body;

    const placement = await StudentPlacement.findOne({ studentId });
    if (!placement) return res.status(404).json({ message: "Placement record not found" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const newRound = {
      roundName: roundName || `Round ${interview.rounds.length + 1}`,
      date: new Date(date),
      mode: mode || "Offline",
      feedback: feedback || "",
      result: result || "Pending",
    };

    interview.rounds.push(newRound);
    await placement.save();

    res.json({ success: true, message: "Interview round added", data: newRound });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 4. Reschedule Interview ──────────────────────────────────
exports.rescheduleInterview = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { newDate } = req.body;
    if (!newDate) return res.status(400).json({ message: "New date is required." });

    const placement = await StudentPlacement.findOne({ studentId });
    if (!placement) return res.status(404).json({ message: "Placement record not found" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.scheduleDate = new Date(newDate);
    interview.rescheduleDate = new Date(newDate);
    interview.status = "Rescheduled";
    await placement.save();

    res.status(200).json({ message: "Interview rescheduled successfully.", updatedData: interview });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ── 5. Get Selected Students (dept/subDept wise) ─────────────
exports.getSelectedStudents = async (req, res) => {
  try {
    const deptFilter = await resolveSubDeptFilter(req.query);
    if (deptFilter === null) return res.status(200).json({ success: true, data: [] });

    const placements = await StudentPlacement.find({
      "PlacementinterviewRecord.status": "Selected",
      placedInfo: null,
      ...deptFilter,
    })
      .populate("studentId", "firstName lastName course prkey")
      .populate("PlacementinterviewRecord.companyRef");

    const data = placements.map(p => ({
      _id: p.studentId?._id,
      name: `${p.studentId?.firstName} ${p.studentId?.lastName}`,
      course: p.studentId?.course,
      prkey: p.studentId?.prkey,
      selectedInterviews: p.PlacementinterviewRecord.filter(i => i.status === "Selected"),
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 6. Confirm Placement ─────────────────────────────────────
exports.confirmPlacement = async (req, res) => {
  try {
    const { studentId, companyName, salary, location, jobProfile, jobType = "Full-Time", joiningDate } = req.body;
    const applicationFile = req.files?.applicationFile?.[0];
    const offerLetterFile = req.files?.offerLetterFile?.[0];

    if (!studentId || !companyName || !salary || !location || !jobProfile)
      return res.status(400).json({ message: "Missing required fields: studentId, companyName, salary, location, jobProfile" });

    if (!applicationFile || !offerLetterFile)
      return res.status(400).json({ message: "Both application file and offer letter file are required" });

    const placement = await StudentPlacement.findOne({ studentId });
    if (!placement) return res.status(404).json({ message: "Placement record not found" });
    if (placement.placedInfo) return res.status(400).json({ message: "Student is already placed" });

    configCloudinary();
    const offerLetterURL = await uploadBase64(
      `data:${offerLetterFile.mimetype};base64,${offerLetterFile.buffer.toString("base64")}`,
      "placement-documents/offer-letters", `${studentId}_offer_${Date.now()}`
    );
    const applicationURL = await uploadBase64(
      `data:${applicationFile.mimetype};base64,${applicationFile.buffer.toString("base64")}`,
      "placement-documents/applications", `${studentId}_application_${Date.now()}`
    );

    const selectedInterview = placement.PlacementinterviewRecord.find(
      i => i.status === "Selected" && i.jobProfile === jobProfile
    );

    let companyRef, interviewRecordId = null;
    if (selectedInterview) {
      companyRef = selectedInterview.companyRef;
      interviewRecordId = selectedInterview._id;
    } else {
      let company = await Company.findOne({ companyName });
      if (!company) {
        company = new Company({ companyName, headOffice: location, hrEmail: "" });
        await company.save();
      }
      companyRef = company._id;
    }

    placement.placedInfo = {
      companyRef, interviewRecordId, companyName,
      salary, location, jobProfile, jobType,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      offerLetterURL, applicationURL,
    };

    await placement.save();
    await Student.findByIdAndUpdate(studentId, { status: "Placed" });

    res.json({
      success: true,
      message: selectedInterview ? "Placement confirmed from interview process" : "Placement confirmed directly",
      data: placement.placedInfo,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 7. Get Placed Students (dept/subDept wise) ───────────────
exports.getPlacedStudents = async (req, res) => {
  try {
    const deptFilter = await resolveSubDeptFilter(req.query);
    if (deptFilter === null) return res.status(200).json({ success: true, data: [] });

    const placements = await StudentPlacement.find({ placedInfo: { $ne: null }, ...deptFilter })
      .populate("studentId", "firstName lastName course prkey email studentMobile")
      .populate("placedInfo.companyRef");

    res.json({ success: true, data: placements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 8. Update Job Type ───────────────────────────────────────
exports.updateJobType = async (req, res) => {
  try {
    const { studentId, interviewId, newJobType, newJobProfile } = req.body;

    const placement = await StudentPlacement.findOne({ studentId });
    if (!placement) return res.status(404).json({ message: "Placement record not found" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (placement.placedInfo && placement.placedInfo.interviewRecordId?.toString() === interviewId) {
      placement.placedInfo.jobType = newJobType;
      if (newJobProfile) placement.placedInfo.jobProfile = newJobProfile;
    }

    await placement.save();
    res.json({ success: true, message: "Job type updated successfully", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── 9. Update Placement Info (direct) ───────────────────────
exports.updatePlacementInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, salary, location, jobProfile } = req.body;

    if (!companyName || !salary || !location || !jobProfile)
      return res.status(400).json({ message: "All fields are required: companyName, salary, location, jobProfile" });

    let company = await Company.findOne({ companyName });
    if (!company) {
      company = new Company({ companyName, location, hrEmail: "hr@" + companyName.toLowerCase().replace(/\s+/g, "") + ".com" });
      await company.save();
    }

    const placement = await getOrCreatePlacement(id);
    placement.placedInfo = {
      ...(placement.placedInfo || {}),
      companyRef: company._id,
      companyName, salary, location, jobProfile,
    };
    await placement.save();

    return res.status(200).json({ message: "Placement information updated successfully.", placedInfo: placement.placedInfo });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── 10. Create Placement Post ────────────────────────────────
exports.createPlacementPost = async (req, res) => {
  try {
    const { studentId, position, companyName, location, hrEmail, companyLogo, headOffice, studentImage } = req.body;

    if (!studentId || !position || !companyName || !headOffice)
      return res.status(400).json({ message: "Missing required fields: studentId, position, companyName, headOffice" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let company = await Company.findOne({ companyName });
    if (!company) {
      if (!companyLogo) return res.status(400).json({ message: "Company logo is required for new company" });
      const logoURL = companyLogo.startsWith("data:image/")
        ? await uploadBase64(companyLogo, "company-logos", `${companyName.replace(/\s+/g, "_")}_${Date.now()}`)
        : companyLogo;
      company = new Company({ companyName, companyLogo: logoURL, headOffice, location, hrEmail });
      await company.save();
    } else if (companyLogo?.startsWith("data:image/")) {
      company.companyLogo = await uploadBase64(companyLogo, "company-logos", `${companyName.replace(/\s+/g, "_")}_${Date.now()}`);
      await company.save();
    }

    let finalStudentImage = studentImage || student.image;
    if (!finalStudentImage) return res.status(400).json({ message: "Student image is required" });
    if (finalStudentImage.startsWith("data:image/"))
      finalStudentImage = await uploadBase64(finalStudentImage, "student-images", `${studentId}_${Date.now()}`);

    res.status(200).json({
      success: true,
      message: "Placement post data prepared successfully",
      data: {
        student: { id: student._id, name: `${student.firstName} ${student.lastName}`, course: student.course, image: finalStudentImage },
        company: { id: company._id, name: company.companyName, logo: company.companyLogo, headOffice: company.headOffice },
        position, createdAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 11. Update Placement Post ────────────────────────────────
exports.updatePlacementPost = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { position, companyName, headOffice, companyLogo, studentImage } = req.body;

    if (!position || !companyName || !headOffice)
      return res.status(400).json({ success: false, message: "Missing required fields: position, companyName, headOffice" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const company = await Company.findOne({ companyName });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    if (companyLogo?.startsWith("data:image/")) {
      company.companyLogo = await uploadBase64(companyLogo, "company-logos", `${companyName.replace(/\s+/g, "_")}_${Date.now()}`);
    }
    company.headOffice = headOffice;
    await company.save();

    let finalStudentImage = student.image;
    if (studentImage?.startsWith("data:image/")) {
      finalStudentImage = await uploadBase64(studentImage, "student-images", `${studentId}_${Date.now()}`);
      student.image = finalStudentImage;
      await student.save();
    }

    const placement = await StudentPlacement.findOne({ studentId });
    if (placement?.placedInfo) { placement.placedInfo.jobProfile = position; await placement.save(); }

    res.status(200).json({
      success: true,
      message: "Placement post updated successfully",
      data: {
        student: { id: student._id, name: `${student.firstName} ${student.lastName}`, image: finalStudentImage, course: student.course },
        company: { id: company._id, name: company.companyName, logo: company.companyLogo, headOffice: company.headOffice },
        position, updatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 12. Get All Companies ────────────────────────────────────
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 13. Get Company by Name ──────────────────────────────────
exports.getCompanyByName = async (req, res) => {
  try {
    const company = await Company.findOne({ companyName: req.params.companyName });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 14. Upload Placement Documents ──────────────────────────
exports.uploadPlacementDocuments = async (req, res) => {
  try {
    const { studentId, offerLetter, commitmentApplication, uploadedBy } = req.body;

    if (!studentId || !offerLetter || !commitmentApplication || !uploadedBy)
      return res.status(400).json({ message: "Missing required fields: studentId, offerLetter, commitmentApplication, uploadedBy" });

    const placement = await StudentPlacement.findOne({ studentId });
    if (!placement) return res.status(404).json({ message: "Placement record not found" });
    if (!placement.placedInfo) return res.status(400).json({ message: "Student is not placed yet" });
    if (placement.offerLetter && placement.commitmentApplication)
      return res.status(400).json({ message: "Documents already uploaded" });

    placement.offerLetter = offerLetter;
    placement.commitmentApplication = commitmentApplication;
    placement.documentsUploadedBy = uploadedBy;
    placement.documentsUploadedAt = new Date();
    await placement.save();

    res.status(200).json({ success: true, message: "Placement documents uploaded successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 15. Get Placement Documents ──────────────────────────────
exports.getPlacementDocuments = async (req, res) => {
  try {
    const placement = await StudentPlacement.findOne({ studentId: req.params.studentId })
      .populate("studentId", "firstName lastName")
      .select("studentId offerLetter commitmentApplication documentsUploadedBy documentsUploadedAt");

    if (!placement || (!placement.offerLetter && !placement.commitmentApplication))
      return res.status(404).json({ message: "No documents found" });

    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 16. Get Student Interview History ───────────────────────
exports.getStudentInterviewHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).select("firstName lastName");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const placement = await StudentPlacement.findOne({ studentId })
      .populate("PlacementinterviewRecord.companyRef");

    if (!placement)
      return res.status(200).json({ success: true, data: { studentName: `${student.firstName} ${student.lastName}`, totalInterviews: 0, interviews: [] } });

    const interviewHistory = placement.PlacementinterviewRecord.map(interview => ({
      _id: interview._id,
      jobProfile: interview.jobProfile,
      status: interview.status,
      statusRemark: interview.statusRemark,
      scheduleDate: interview.scheduleDate,
      rescheduleDate: interview.rescheduleDate,
      rounds: interview.rounds,
      company: interview.companyRef ? {
        _id: interview.companyRef._id,
        companyName: interview.companyRef.companyName,
        location: interview.companyRef.location,
        companyLogo: interview.companyRef.companyLogo,
        hrEmail: interview.companyRef.hrEmail,
        hrContact: interview.companyRef.hrContact,
      } : null,
    }));

    res.status(200).json({
      success: true,
      data: { studentName: `${student.firstName} ${student.lastName}`, totalInterviews: interviewHistory.length, interviews: interviewHistory },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 17. Get Placed Students by Company ──────────────────────
exports.getPlacedStudentsByCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const placements = await StudentPlacement.find({ "placedInfo.companyRef": req.params.companyId })
      .populate("studentId", "firstName lastName email studentMobile course prkey")
      .populate("placedInfo.companyRef", "companyName companyLogo location");

    res.status(200).json({ success: true, company: company.companyName, totalPlaced: placements.length, students: placements });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ── 18. Upload Resume Base64 ─────────────────────────────────
exports.uploadResumeBase64 = async (req, res) => {
  const { studentId, fileData } = req.body;
  if (!studentId || !fileData)
    return res.status(400).json({ success: false, message: "Missing studentId or fileData" });

  let formattedFileData = fileData;
  if (!fileData.startsWith("data:"))
    formattedFileData = `data:application/pdf;base64,${fileData}`;

  let uploadedFile;
  try {
    configCloudinary();
    uploadedFile = await cloudinary.uploader.upload(formattedFileData, {
      folder: "student_resumes",
      resource_type: "raw",
      format: "pdf",
      public_id: `resume_${studentId}_${Date.now()}`,
      access_mode: "public",
    });

    const directUrl = uploadedFile.secure_url.replace("/image/upload/", "/raw/upload/");

    const placement = await getOrCreatePlacement(studentId);
    placement.resumeURL = directUrl;
    await placement.save();

    await Student.findByIdAndUpdate(studentId, { resumeURL: directUrl });

    res.status(200).json({ success: true, message: "Resume uploaded successfully", resumeUrl: directUrl });
  } catch (error) {
    if (uploadedFile) {
      try { await cloudinary.uploader.destroy(uploadedFile.public_id, { resource_type: "raw" }); } catch (_) {}
    }
    res.status(500).json({ success: false, message: "Upload failed.", error: error.message });
  }
};
