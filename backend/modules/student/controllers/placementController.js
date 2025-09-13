const AdmittedStudent = require("../models/admittedStudent");
const Company = require("../models/company");
const cloudinary = require('../../../config/cloudinaryConfig');

// 1. CREATE/SCHEDULE INTERVIEW (from Ready Students) - Using original URL pattern
exports.createInterview = async (req, res) => {
  try {
    const studentId = req.params.id; // From URL parameter
    const { companyName, hrEmail, hrContact, location, jobProfile, scheduleDate } = req.body;

    if (!companyName || !hrEmail || !location || !jobProfile || !scheduleDate) {
      return res.status(400).json({ 
        message: "Missing required fields: companyName, hrEmail, location, jobProfile, scheduleDate" 
      });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student || student.readinessStatus !== 'Ready') {
      return res.status(400).json({ message: "Student not ready for placement" });
    }

    // Find or create company
    let company = await Company.findOne({ companyName });
    if (!company) {
      // Create new company with HR details (logo will be added during post creation)
      company = new Company({ 
        companyName, 
        hrEmail, 
        hrContact: hrContact || "", // Optional field
        location 
      });
      await company.save();
    }

    // Create interview record with company reference
    const newInterview = {
      companyRef: company._id,
      jobProfile,
      status: 'Scheduled',
      scheduleDate: new Date(scheduleDate),
      rounds: []
    };

    student.PlacementinterviewRecord.push(newInterview);
    await student.save();

    res.status(201).json({ 
      success: true, 
      message: "Interview scheduled successfully",
      data: {
        interview: newInterview,
        company: company
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. UPDATE INTERVIEW STATUS (Ongoing/Pending/Reschedule/Cancel)
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { status, rescheduleDate } = req.body;

    const student = await AdmittedStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const interview = student.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.status = status;
    if (status === 'Rescheduled' && rescheduleDate) {
      interview.rescheduleDate = new Date(rescheduleDate);
    }

    await student.save();
    res.json({ success: true, message: "Interview status updated", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. ADD INTERVIEW ROUND
exports.addInterviewRound = async (req, res) => {
  let hasResponded = false;
  
  try {
    const { studentId, interviewId } = req.params;
    const { roundName, date, mode, feedback, result } = req.body;

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      hasResponded = true;
      return res.status(404).json({ message: "Student not found" });
    }

    const interview = student.PlacementinterviewRecord.id(interviewId);
    if (!interview) {
      hasResponded = true;
      return res.status(404).json({ message: "Interview not found" });
    }

    const newRound = {
      roundName: roundName || `Round ${interview.rounds.length + 1}`,
      date: new Date(date),
      mode: mode || 'Offline',
      feedback: feedback || '',
      result: result || 'Pending'
    };

    interview.rounds.push(newRound);
    await student.save();
    
    if (!hasResponded) {
      hasResponded = true;
      res.json({ 
        success: true, 
        message: "Interview round added", 
        data: newRound
      });
    }
  } catch (error) {
    if (!hasResponded) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

// 4. GET SELECTED STUDENTS (Not yet placed)
exports.getSelectedStudents = async (req, res) => {
  try {
    const students = await AdmittedStudent.find({
      "PlacementinterviewRecord.status": "Selected",
      placedInfo: null
    }).populate('PlacementinterviewRecord.companyRef');

    const selectedStudents = students.map(student => ({
      _id: student._id,
      name: `${student.firstName} ${student.lastName}`,
      course: student.course,
      selectedInterviews: student.PlacementinterviewRecord.filter(interview => 
        interview.status === 'Selected'
      )
    }));

    res.json({ success: true, data: selectedStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. CONFIRM PLACEMENT (Auto-detect interview-based or direct placement)

exports.confirmPlacement = async (req, res) => {
  try {
    const { 
      studentId, 
      companyName, 
      salary, 
      location, 
      jobProfile, 
      jobType = 'Full-Time',
      joiningDate
    } = req.body;

    // Get uploaded files
    const applicationFile = req.files?.applicationFile?.[0];
    const offerLetterFile = req.files?.offerLetterFile?.[0];

    if (!studentId || !companyName || !salary || !location || !jobProfile) {
      return res.status(400).json({ 
        message: "Missing required fields: studentId, companyName, salary, location, jobProfile" 
      });
    }

    if (!applicationFile || !offerLetterFile) {
      return res.status(400).json({ 
        message: "Both application file and offer letter file are required" 
      });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.placedInfo) {
      return res.status(400).json({ message: "Student is already placed" });
    }

    // ✅ Always upload to Cloudinary if data provided
    let offerLetterURL = null;
    let applicationURL = null;

    if (offerLetter) {
      try {
        const offerResult = await cloudinary.uploader.upload(offerLetter, {
          folder: 'placement-documents/offer-letters',
          resource_type: 'auto',
          public_id: `${studentId}_offer_${Date.now()}`
        });
        offerLetterURL = offerResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error uploading offer letter", error: error.message });
      }
    }

    if (application) {
      try {
        const appResult = await cloudinary.uploader.upload(application, {
          folder: 'placement-documents/applications',
          resource_type: 'auto',
          public_id: `${studentId}_application_${Date.now()}`
        });
        applicationURL = appResult.secure_url;
      } catch (error) {
        return res.status(500).json({ success: false, message: "Error uploading application", error: error.message });
      }
    }

    // Auto-detect interview or direct placement
    const selectedInterview = student.PlacementinterviewRecord.find(interview => 
      interview.status === 'Selected' && interview.jobProfile === jobProfile
    );

    let companyRef;
    let interviewRecordId = null;

    if (selectedInterview) {
      companyRef = selectedInterview.companyRef;
      interviewRecordId = selectedInterview._id;
    } else {
      let company = await Company.findOne({ companyName });
      if (!company) {
        company = new Company({
          companyName,
          headOffice: location,
          hrEmail: "",
          hrContact: ""
        });
        await company.save();
      }
      companyRef = company._id;
    }

    student.placedInfo = {
      companyRef,
      interviewRecordId,
      companyName,
      salary,
      location,
      jobProfile,
      jobType,
      joiningDate: joiningDate ? new Date(joiningDate) : null,
      offerLetterURL,
      applicationURL
    };

    await student.save();

    res.json({ 
      success: true, 
      message: selectedInterview ? 
        "Student placement confirmed from interview process" : 
        "Student placement confirmed directly",
      data: student.placedInfo
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 6. GET PLACED STUDENTS
exports.getPlacedStudents = async (req, res) => {
  try {
    const placedStudents = await AdmittedStudent.find({
      placedInfo: { $ne: null }
    }).populate('placedInfo.companyRef');

    res.json({ success: true, data: placedStudents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 7. UPDATE JOB TYPE (Internship to Full-Time/PPO)
exports.updateJobType = async (req, res) => {
  try {
    const { studentId, interviewId, newJobType, newJobProfile, internshipEndDate } = req.body;

    const student = await AdmittedStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const interview = student.PlacementinterviewRecord.id(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // Update internship to job conversion
    interview.internshipToJobUpdate = {
      isIntern: newJobType === 'Internship',
      internshipEndDate: internshipEndDate || '',
      updatedJobProfile: newJobProfile || interview.jobProfile
    };

    // If student is placed, update placedInfo as well
    if (student.placedInfo && student.placedInfo.interviewRecordId.toString() === interviewId) {
      student.placedInfo.jobType = newJobType;
      student.placedInfo.jobProfile = newJobProfile || student.placedInfo.jobProfile;
    }

    await student.save();
    res.json({ success: true, message: "Job type updated successfully", data: interview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 8. CREATE PLACEMENT POST (from Placed Students)
exports.createPlacementPost = async (req, res) => {
  try {
    console.log("Request body:", req.body);

    const {
      studentId,
      position,
      companyName,
      location,
       hrEmail,
      companyLogo,
      headOffice,
      studentImage
    } = req.body;

    // ✅ Validate required fields
    if (!studentId || !position || !companyName || !headOffice) {
      return res.status(400).json({
        message: "Missing required fields: studentId, position, companyName, headOffice"
      });
    }

    // ✅ Find student
    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Find or create company
    let company = await Company.findOne({ companyName });

    if (!company) {
      if (!companyLogo) {
        return res.status(400).json({
          message: "Company logo is required for new company. Please provide base64 image or upload file.",
          example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
        });
      }

      let logoURL;

      if (companyLogo.startsWith("data:image/")) {
        try {
          const logoResult = await cloudinary.uploader.upload(companyLogo, {
            folder: "company-logos",
            resource_type: "image"
          });
          console.log("✅ Cloudinary upload success:", logoResult.secure_url);
          logoURL = logoResult.secure_url;
        } catch (error) {
          console.error("❌ Cloudinary upload failed:", error);
          return res.status(500).json({
            success: false,
            message: "Cloudinary upload failed",
            error: error.message
          });
        }
      } else {
        logoURL = companyLogo; // If direct URL given
      }

      company = new Company({
        companyName,
        companyLogo: logoURL,
        headOffice,
        location,
         hrEmail
      });

      await company.save();
    } else if (companyLogo && companyLogo.startsWith("data:image/")) {
      // ✅ Update existing company logo
      try {
        const logoResult = await cloudinary.uploader.upload(companyLogo, {
          folder: "company-logos",
          resource_type: "image"
        });
        company.companyLogo = logoResult.secure_url;
        await company.save();
        console.log("✅ Company logo updated:", logoResult.secure_url);
      } catch (error) {
        console.error("❌ Failed to update company logo:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to update company logo",
          error: error.message
        });
      }
    }

    // ✅ Handle student image (either new or from DB)
    let finalStudentImage = studentImage || student.image;

    if (!finalStudentImage) {
      return res.status(400).json({
        message: "Student image is required (either upload new or student must have profile image)"
      });
    }

    if (finalStudentImage.startsWith("data:image/")) {
      try {
        const studentResult = await cloudinary.uploader.upload(finalStudentImage, {
          folder: "student-images",
          resource_type: "image"
        });
        finalStudentImage = studentResult.secure_url;
        console.log("✅ Student image uploaded:", studentResult.secure_url);
      } catch (error) {
        console.error("❌ Student image upload failed:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload student image",
          error: error.message
        });
      }
    }

    // ✅ Prepare final placement post object
    const placementPostData = {
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        year: student.year,
        course: student.course,
        image: finalStudentImage
      },
      company: {
        id: company._id,
        name: company.companyName,
        logo: company.companyLogo,
        headOffice: company.headOffice
      },
      position,
      createdAt: new Date()
    };

    // ✅ Send response
    res.status(200).json({
      success: true,
      message: "Placement post data prepared successfully",
      data: placementPostData
    });

  } catch (error) {
    console.error("❌ Error creating placement post:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


exports.getAllCompanies = async (req, res) => {
  try {
    // Fetch all companies with all schema fields
    const companies = await Company.find();  

    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};


// Get company by name
exports.getCompanyByName = async (req, res) => {
  try {
    const { companyName } = req.params;
    const company = await Company.findOne({ companyName });
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: "Company not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Upload placement documents
exports.uploadPlacementDocuments = async (req, res) => {
  try {
    const { 
      studentId, 
      offerLetter, 
      commitmentApplication, 
      uploadedBy 
    } = req.body;

    if (!studentId || !offerLetter || !commitmentApplication || !uploadedBy) {
      return res.status(400).json({ 
        message: "Missing required fields: studentId, offerLetter, commitmentApplication, uploadedBy" 
      });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.placedInfo) {
      return res.status(400).json({ message: "Student is not placed yet" });
    }

    if (student.offerLetter && student.commitmentApplication) {
      return res.status(400).json({ message: "Documents already uploaded" });
    }

    student.offerLetter = offerLetter;
    student.commitmentApplication = commitmentApplication;
    student.documentsUploadedBy = uploadedBy;
    student.documentsUploadedAt = new Date();

    await student.save();

    res.status(200).json({
      success: true,
      message: "Placement documents uploaded successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get placement documents
exports.getPlacementDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await AdmittedStudent.findById(studentId)
      .select('firstName lastName offerLetter commitmentApplication documentsUploadedBy documentsUploadedAt');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.offerLetter || !student.commitmentApplication) {
      return res.status(404).json({ message: "No documents found" });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get student interview history with company details
exports.getStudentInterviewHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await AdmittedStudent.findById(studentId)
      .populate('PlacementinterviewRecord.companyRef')
      .select('firstName lastName PlacementinterviewRecord');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const interviewHistory = student.PlacementinterviewRecord.map(interview => ({
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
        hrContact: interview.companyRef.hrContact
      } : null
    }));

    res.status(200).json({
      success: true,
      data: {
        studentName: `${student.firstName} ${student.lastName}`,
        totalInterviews: interviewHistory.length,
        interviews: interviewHistory
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};



exports.getPlacedStudentsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // check if company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found"
      });
    }

    // find all students who have placedInfo with this companyRef
    const students = await AdmittedStudent.find({ 
      "placedInfo.companyRef": companyId 
    })
    .select("firstName lastName email studentMobile course stream placedInfo")
    .populate("placedInfo.companyRef", "companyName companyLogo location");

    res.status(200).json({
      success: true,
      company: company.companyName,
      totalPlaced: students.length,
      students
    });

  } catch (error) {
    console.error("Error fetching placed students:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};