const mongoose = require("mongoose");
const Student = require("../../models/student/Student");
const StudentPlacement = require("../../models/placement/StudentPlacement");
const Company = require("../../models/company/company");
const cloudinary = require("../../config/cloudinaryConfig");
const { withTransaction } = require("../../utils/withTransaction");

// ── Helper: build placement filter respecting dept access ────
const placementFilter = (req, extra = {}) => ({
  ...(req.subDeptFilter || {}),
  ...extra,
});

// 0. GET READY STUDENTS
exports.getReadyStudents = async (req, res) => {
  try {
    const filter = placementFilter(req, {
      readinessStatus: { $in: ["Ready", "Ready for Interview"] },
    });

    const placements = await StudentPlacement.find(filter)
      .populate("studentId", "firstName lastName prkey course studentMobile image")
      .lean();

    const data = placements.map((p) => ({
      _id: p.studentId?._id,
      firstName: p.studentId?.firstName,
      lastName: p.studentId?.lastName,
      prkey: p.studentId?.prkey,
      course: p.studentId?.course,
      studentMobile: p.studentId?.studentMobile,
      image: p.studentId?.image,
      readinessStatus: p.readinessStatus,
      PlacementinterviewRecord: p.PlacementinterviewRecord,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 1. CREATE/SCHEDULE INTERVIEW
exports.createInterview = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { companyName, hrEmail, hrContact, location, jobProfile, scheduleDate } = req.body;

    if (!companyName || !hrEmail || !location || !jobProfile || !scheduleDate) {
      return res.status(400).json({
        message: "Missing required fields: companyName, hrEmail, location, jobProfile, scheduleDate",
      });
    }

    const placement = await StudentPlacement.findOne(
      placementFilter(req, { studentId })
    );
    if (!placement || !["Ready", "Ready for Interview"].includes(placement.readinessStatus)) {
      return res.status(400).json({ message: "Student not ready for placement or access denied" });
    }

    let company = await Company.findOne({ companyName });
    if (!company) {
      company = new Company({ companyName, hrEmail, hrContact: hrContact || "", location });
      await company.save();
    } else {
      company.hrEmail = hrEmail;
      company.hrContact = hrContact || company.hrContact;
      company.location = location;
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

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: { interview: newInterview, company },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. UPDATE INTERVIEW STATUS
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { status, rescheduleDate } = req.body;

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = status;
    if (status === "Rescheduled" && rescheduleDate) {
      interview.rescheduleDate = new Date(rescheduleDate);
    }

    await placement.save();
    res.json({ success: true, message: "Interview status updated", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. ADD INTERVIEW ROUND
exports.addInterviewRound = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { roundName, date, mode, feedback, result } = req.body;

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

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

// 4. RESCHEDULE INTERVIEW
exports.rescheduleInterview = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { rescheduleDate, newDate } = req.body;
    const dateValue = rescheduleDate || newDate;

    if (!dateValue) return res.status(400).json({ message: "rescheduleDate is required" });

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = "Rescheduled";
    interview.rescheduleDate = new Date(dateValue);
    await placement.save();

    res.json({ success: true, message: "Interview rescheduled", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. GET SELECTED STUDENTS
exports.getSelectedStudents = async (req, res) => {
  try {
    const filter = placementFilter(req, {
      "PlacementinterviewRecord.status": "Selected",
      placedInfo: null,
    });

    const placements = await StudentPlacement.find(filter)
      .populate("studentId", "firstName lastName prkey course studentMobile image")
      .populate("PlacementinterviewRecord.companyRef", "companyName location")
      .lean();

    const data = placements.map((p) => ({
      _id: p.studentId?._id,
      firstName: p.studentId?.firstName,
      lastName: p.studentId?.lastName,
      name: p.studentId ? `${p.studentId.firstName} ${p.studentId.lastName}` : "—",
      prkey: p.studentId?.prkey,
      course: p.studentId?.course,
      studentMobile: p.studentId?.studentMobile,
      image: p.studentId?.image,
      readinessStatus: p.readinessStatus,
      selectedInterviews: p.PlacementinterviewRecord.filter((i) => i.status === "Selected"),
      PlacementinterviewRecord: p.PlacementinterviewRecord,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. CONFIRM PLACEMENT
exports.confirmPlacement = async (req, res) => {
  try {
    const { studentId, companyName, salary, location, jobProfile, jobType = "Full-Time", joiningDate } = req.body;

    if (!studentId || !companyName || !salary || !location || !jobProfile) {
      return res.status(400).json({
        message: "Missing required fields: studentId, companyName, salary, location, jobProfile",
      });
    }

    // Pre-flight checks before opening transaction
    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });
    if (placement.placedInfo) return res.status(400).json({ message: "Student is already placed" });

    // Upload documents to Cloudinary BEFORE transaction — Cloudinary is external,
    // cannot be rolled back, so do it outside the DB transaction
    const { offerLetter, commitmentApplication } = req.body;
    let offerLetterURL = null;
    let applicationURL = null;

    if (offerLetter) {
      const r = await cloudinary.uploader.upload(offerLetter, {
        folder: "placement-documents/offer-letters",
        resource_type: "auto",
        public_id: `${studentId}_offer_${Date.now()}`,
      });
      offerLetterURL = r.secure_url;
    }

    if (commitmentApplication) {
      const r = await cloudinary.uploader.upload(commitmentApplication, {
        folder: "placement-documents/applications",
        resource_type: "auto",
        public_id: `${studentId}_application_${Date.now()}`,
      });
      applicationURL = r.secure_url;
    }

    // Resolve company and interview record
    const selectedInterview = placement.PlacementinterviewRecord.find(
      (i) => i.status === "Selected" && i.jobProfile === jobProfile
    );

    let companyRef;
    let interviewRecordId = null;

    if (selectedInterview) {
      companyRef = selectedInterview.companyRef;
      interviewRecordId = selectedInterview._id;
    } else {
      let company = await Company.findOne({ companyName });
      if (!company) {
        company = new Company({ companyName, headOffice: location, hrEmail: "", hrContact: "" });
        await company.save();
      }
      companyRef = company._id;
    }

    const placedInfoPayload = {
      companyRef,
      interviewRecordId,
      companyName,
      salary,
      location,
      jobProfile,
      jobType,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      offerLetterURL,
      applicationURL,
    };

    // Atomic write — placement.placedInfo + Student.status = "Placed" together
    // If either fails, both are rolled back (on replica set) or both run (standalone)
    await withTransaction(async (session) => {
      placement.placedInfo = placedInfoPayload;
      await placement.save({ session });
      await Student.findByIdAndUpdate(
        studentId,
        { status: "Placed" },
        { session }
      );
    });

    res.json({
      success: true,
      message: selectedInterview
        ? "Student placement confirmed from interview process"
        : "Student placement confirmed directly",
      data: placedInfoPayload,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. GET PLACED STUDENTS
exports.getPlacedStudents = async (req, res) => {
  try {
    const filter = placementFilter(req, { placedInfo: { $ne: null } });

    const placements = await StudentPlacement.find(filter)
      .populate("studentId", "firstName lastName prkey course email studentMobile image")
      .populate("placedInfo.companyRef", "companyName location companyLogo")
      .lean();

    const data = placements.map((p) => ({
      _id: p.studentId?._id,
      firstName: p.studentId?.firstName,
      lastName: p.studentId?.lastName,
      prkey: p.studentId?.prkey,
      course: p.studentId?.course,
      email: p.studentId?.email,
      studentMobile: p.studentId?.studentMobile,
      image: p.studentId?.image,
      readinessStatus: p.readinessStatus,
      placedInfo: p.placedInfo,
      PlacementinterviewRecord: p.PlacementinterviewRecord,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. UPDATE JOB TYPE
exports.updateJobType = async (req, res) => {
  try {
    const { studentId, interviewId, newJobType, newJobProfile, internshipEndDate } = req.body;

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

    const interview = placement.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.internshipToJobUpdate = {
      isIntern: newJobType === "Internship",
      internshipEndDate: internshipEndDate || "",
      updatedJobProfile: newJobProfile || interview.jobProfile,
    };

    if (placement.placedInfo && placement.placedInfo.interviewRecordId?.toString() === interviewId) {
      placement.placedInfo.jobType = newJobType;
      placement.placedInfo.jobProfile = newJobProfile || placement.placedInfo.jobProfile;
    }

    await placement.save();
    res.json({ success: true, message: "Job type updated successfully", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 9. UPDATE PLACEMENT INFO
exports.updatePlacementInfo = async (req, res) => {
  try {
    const { id } = req.params; // studentId
    const allowedFields = ["salary", "location", "jobProfile", "jobType", "joiningDate"];
    const updateData = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updateData[`placedInfo.${f}`] = req.body[f];
    });

    const placement = await StudentPlacement.findOneAndUpdate(
      placementFilter(req, { studentId: id }),
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

    res.json({ success: true, message: "Placement info updated", data: placement.placedInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 10. CREATE PLACEMENT POST
exports.createPlacementPost = async (req, res) => {
  try {
    const { studentId, position, companyName, location, hrEmail, companyLogo, headOffice, studentImage } = req.body;

    if (!studentId || !position || !companyName || !headOffice) {
      return res.status(400).json({ message: "Missing required fields: studentId, position, companyName, headOffice" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let company = await Company.findOne({ companyName });

    if (!company) {
      if (!companyLogo) return res.status(400).json({ message: "Company logo is required for new company" });
      let logoURL = companyLogo;
      if (companyLogo.startsWith("data:image/")) {
        const r = await cloudinary.uploader.upload(companyLogo, { folder: "company-logos", resource_type: "image" });
        logoURL = r.secure_url;
      }
      company = new Company({
        companyName,
        companyLogo: logoURL,
        headOffice,
        location: location || headOffice,
        hrEmail: hrEmail || "not-provided@example.com",
      });
      await company.save();
    } else {
      if (companyLogo?.startsWith("data:image/")) {
        const r = await cloudinary.uploader.upload(companyLogo, { folder: "company-logos", resource_type: "image" });
        company.companyLogo = r.secure_url;
        await company.save();
      }
    }

    let finalStudentImage = studentImage || student.image;
    if (!finalStudentImage) return res.status(400).json({ message: "Student image is required" });
    if (finalStudentImage.startsWith("data:image/")) {
      const r = await cloudinary.uploader.upload(finalStudentImage, { folder: "student-images", resource_type: "image" });
      finalStudentImage = r.secure_url;
    }

    res.status(200).json({
      success: true,
      message: "Placement post data prepared successfully",
      data: {
        student: { id: student._id, name: `${student.firstName} ${student.lastName}`, course: student.course, image: finalStudentImage },
        company: { id: company._id, name: company.companyName, logo: company.companyLogo, headOffice: company.headOffice },
        position,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 11. UPDATE PLACEMENT POST
exports.updatePlacementPost = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { position, companyName, headOffice, companyLogo, studentImage } = req.body;

    if (!position || !companyName || !headOffice) {
      return res.status(400).json({ message: "Missing required fields: position, companyName, headOffice" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const company = await Company.findOne({ companyName });
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (companyLogo?.startsWith("data:image/")) {
      const r = await cloudinary.uploader.upload(companyLogo, { folder: "company-logos", resource_type: "image" });
      company.companyLogo = r.secure_url;
    }
    company.headOffice = headOffice;
    await company.save();

    let finalStudentImage = student.image;
    if (studentImage?.startsWith("data:image/")) {
      const r = await cloudinary.uploader.upload(studentImage, { folder: "student-images", resource_type: "image" });
      finalStudentImage = r.secure_url;
      student.image = finalStudentImage;
      await student.save();
    }

    const placement = await StudentPlacement.findOne({ studentId });
    if (placement?.placedInfo) {
      placement.placedInfo.jobProfile = position;
      await placement.save();
    }

    res.status(200).json({
      success: true,
      message: "Placement post updated successfully",
      data: {
        student: { id: student._id, name: `${student.firstName} ${student.lastName}`, image: finalStudentImage, course: student.course },
        company: { id: company._id, name: company.companyName, logo: company.companyLogo, headOffice: company.headOffice },
        position,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 12. GET ALL COMPANIES
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 13. GET COMPANY BY NAME
exports.getCompanyByName = async (req, res) => {
  try {
    const company = await Company.findOne({ companyName: req.params.companyName });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.status(200).json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 14. UPLOAD PLACEMENT DOCUMENTS
exports.uploadPlacementDocuments = async (req, res) => {
  try {
    const { studentId, offerLetter, commitmentApplication, uploadedBy } = req.body;

    if (!studentId || !offerLetter || !commitmentApplication || !uploadedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });
    if (!placement.placedInfo) return res.status(400).json({ message: "Student is not placed yet" });
    if (placement.offerLetter && placement.commitmentApplication) {
      return res.status(400).json({ message: "Documents already uploaded" });
    }

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

// 15. GET PLACEMENT DOCUMENTS
exports.getPlacementDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }))
      .populate("studentId", "firstName lastName")
      .select("studentId offerLetter commitmentApplication documentsUploadedBy documentsUploadedAt");

    if (!placement) return res.status(404).json({ message: "No documents found or access denied" });

    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 16. GET STUDENT INTERVIEW HISTORY
exports.getStudentInterviewHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }))
      .populate("PlacementinterviewRecord.companyRef")
      .populate("studentId", "firstName lastName");

    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

    const interviews = placement.PlacementinterviewRecord.map((i) => ({
      _id: i._id,
      jobProfile: i.jobProfile,
      status: i.status,
      scheduleDate: i.scheduleDate,
      rescheduleDate: i.rescheduleDate,
      rounds: i.rounds,
      company: i.companyRef
        ? { _id: i.companyRef._id, companyName: i.companyRef.companyName, location: i.companyRef.location, companyLogo: i.companyRef.companyLogo }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        studentName: placement.studentId ? `${placement.studentId.firstName} ${placement.studentId.lastName}` : "—",
        totalInterviews: interviews.length,
        interviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 17. GET PLACED STUDENTS BY COMPANY
exports.getPlacedStudentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const filter = placementFilter(req, { "placedInfo.companyRef": companyId });

    const placements = await StudentPlacement.find(filter)
      .populate("studentId", "firstName lastName email studentMobile course stream")
      .populate("placedInfo.companyRef", "companyName companyLogo location")
      .lean();

    res.status(200).json({
      success: true,
      company: company.companyName,
      totalPlaced: placements.length,
      students: placements,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 18. UPLOAD RESUME BASE64
exports.uploadResumeBase64 = async (req, res) => {
  try {
    const { studentId, resumeBase64 } = req.body;
    if (!studentId || !resumeBase64) return res.status(400).json({ message: "studentId and resumeBase64 are required" });

    const placement = await StudentPlacement.findOne(placementFilter(req, { studentId }));
    if (!placement) return res.status(404).json({ message: "Student placement not found or access denied" });

    const result = await cloudinary.uploader.upload(resumeBase64, {
      folder: "student-resumes",
      resource_type: "auto",
      public_id: `${studentId}_resume_${Date.now()}`,
    });

    placement.resumeURL = result.secure_url;
    await placement.save();

    res.json({ success: true, message: "Resume uploaded successfully", resumeURL: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
