const AdmissionProcess = require("../models/admissionProcessStudent");
const AdmittedStudent = require("../models/admittedStudent");
const Company = require("../models/company");
const { sendHTMLMail } = require("./emailController");

const { sendEmail } = require("./emailController");
const cloudinary = require("../../../config/cloudinaryConfig");

const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const multer = require("multer");

// Multer config to hold file in memory (no disk save)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("resume");

// ✅ Create New Admitted Student (from AdmissionProcess)
exports.createAdmittedStudent = async (req, res) => {
  try {
    console.log("Received request to create admitted student:", req.body); // Important for debugging

    const admissionId = req.updatedStudent._id;

    const admissionData = await AdmissionProcess.findById(admissionId);
    console.log("Admission Data Found:", admissionData);

    if (!admissionData || !admissionData.admissionStatus) {
      return res
        .status(400)
        .json({ message: "Student not cleared or not found." });
    }

    const newAdmitted = new AdmittedStudent({
      admissionRef: admissionData._id,
      prkey: admissionData.prkey,
      firstName: admissionData.firstName,
      lastName: admissionData.lastName,
      // fullName: `${admissionData.firstName} ${admissionData.lastName}`,
      fatherName: admissionData.fatherName,
      email: admissionData.email,
      studentMobile: admissionData.studentMobile,
      parentMobile: admissionData.parentMobile,
      gender: admissionData.gender,
      dob: admissionData.dob,
      aadharCard: admissionData.aadharCard,
      village: admissionData.village,
      track: admissionData.track,
      category: admissionData.category,
      stream: admissionData.stream,
      course: admissionData.course,
      subject12: admissionData.subject12,
      year12: admissionData.year12,
      percent12: admissionData.percent12,
      percent10: admissionData.percent10,
      address: admissionData.address,
      // Optional
    });

    await newAdmitted.save();
    return res
      .status(201)
      .json({ message: "Student admitted", data: newAdmitted });
  } catch (error) {
    console.error("Error during admission:", error); // Important for debugging
    return res
      .status(500)
      .json({ message: "Admission failed", error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await AdmittedStudent.find({
      $or: [
        { permissionDetails: { $exists: false } },
        { permissionDetails: null },
        { permissionDetails: {} },
      ],
    }).sort({ updatedAt: -1 });
    console.log("Fetched all students:", students.length);
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getAllStudentsByLevel = async (req, res) => {
  // try {
  //   const { levelNo } = req.params;
  //   console.log("Fetching students for level:", levelNo);
  //   const students = await AdmittedStudent.find({ level: levelNo });
  //   res.status(200).json(students);
  // } catch (error) {
  //   console.error("Error fetching students by level:", error);
  //   res.status(500).json({ message: error.message });
  // }
  try {
    const { levelNo } = req.params;

    const students = await AdmittedStudent.aggregate([
      {
        $addFields: {
          latestLevel: { $arrayElemAt: ["$level", -1] },
        },
      },
      {
        $match: {
          "latestLevel.levelNo": levelNo,
          $or: [
            { permissionDetails: { $exists: false } },
            { permissionDetails: null },
            { permissionDetails: {} },
          ],
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this level" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students by latest level:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updatedStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      stream,
      course,
      fatherName,
      mobileNo,
      email,
      address,
      village,
      track,
    } = req.body;
    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.fullName = fullName || student.fullName;
    student.stream = stream || student.stream;
    student.course = course || student.course;
    student.fatherName = fatherName || student.fatherName;
    student.mobileNo = mobileNo || student.mobileNo;
    student.email = email || student.email;
    student.address = address || student.address;
    student.village = village || student.village;
    student.track = track || student.track;
    student.year = year || student.year;
    await student.save();
    res.status(200).json({ message: "Student updated successfully", student });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.createLevels = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      levelNo,
      Topic,
      Theoretical_Marks,
      Practical_Marks,
      Communication_Marks,
      marks,
      remark,
      date,
      result,
    } = req.body;

    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const interviews = student.level || [];

    const LevelOrder = ["1A", "1B", "1C", "2A", "2B", "2C"];

    // Find previous highest passed round
    let lastPassedRoundIndex = -1;
    for (let i = 0; i < LevelOrder.length; i++) {
      const passed = interviews.some(
        (interview) =>
          interview.levelNo === LevelOrder[i] && interview.result === "Pass"
      );
      if (passed) {
        lastPassedRoundIndex = i;
      } else {
        break;
      }
    }

    const nextLevel = LevelOrder[lastPassedRoundIndex + 1];

    if (!nextLevel) {
      return res.status(400).json({
        success: false,
        message: "All levels already passed. No further levels to attempt.",
      });
    }

    // Check if round already passed
    const currentLevelAttempts = interviews.filter(
      (i) => i.levelNo === nextLevel
    );

    if (currentLevelAttempts.some((i) => i.result === "Pass")) {
      return res.status(400).json({
        success: false,
        message: `Round ${nextLevel} already passed. Please move to next round.`,
      });
    }

    const newInterview = {
      levelNo: nextLevel,
      noOfAttempts: currentLevelAttempts.length + 1,
      Topic: Topic || "",
      Theoretical_Marks: Theoretical_Marks || 0,
      Practical_Marks: Practical_Marks || 0,
      Communication_Marks: Communication_Marks || 0,
      marks: marks || 0,
      remark: remark || "",
      date: date || new Date(),
      result: result || "Pending",
    };

    student.level.push(newInterview);

    // ✅ Update currentLevel if pass
    if (newInterview.result === "Pass") {
      const currentLevelIndex = LevelOrder.indexOf(newInterview.levelNo);
      const nextLevelInOrder = LevelOrder[currentLevelIndex + 1];

      if (nextLevelInOrder) {
        student.currentLevel = nextLevelInOrder;
      }

      // Mark student ready if all levels are passed
      const allLevelsPassed = LevelOrder.every((level) =>
        student.level.some(
          (entry) => entry.levelNo === level && entry.result === "Pass"
        )
      );

      if (newInterview.result === "Pass" && newInterview.levelNo === "1C") {
        if (student?.email) {
          await sendHTMLMail({
            to: student.email,
            studentName: student.firstName + " " + student.lastName,
          });
          console.log("Email sent to student:", student.email);
        } else {
          console.log(
            "❌ No email found for student:",
            student?.prkey || student?._id
          );
        }
      }

      if (allLevelsPassed) {
        student.readinessStatus = "Ready";
      }

      // Send email after 1C passed
      if (newInterview.levelNo === "1C" && student.email) {
        await sendHTMLMail({
          to: student.email,
          studentName: student.firstName + " " + student.lastName,
        });
      }
    }

    // Send fail email if applicable
    if (newInterview.result === "Fail" && student.email) {
      await sendEmail({
        to: student.email,
        subject: `Interview Result - Level  ${newInterview.levelNo}`,
        text: `Hi ${student.firstName},\n\nThank you for attending the level interview. We regret to inform you that you have not cleared the interview for Level  ${newInterview.levelNo}.\r\n\r\nWe appreciate your effort and encourage you to stay positive and keep striving for future opportunities.\r\n\r\nBest wishes`,
      });
    }

    await student.save();

    res.status(201).json({
      success: true,
      message: "Interview round added successfully",
      student,
    });
  } catch (error) {
    console.error("Error adding interview round:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// Get all students with permissionDetails granted
exports.getAllPermissionStudents = async (req, res) => {
  try {
    const students = await AdmittedStudent.find({
      permissionDetails: { $ne: null },
    })
      .select("-password")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Get Permission Students Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updatePermissionStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { imageURL, remark, approved_by } = req.body;

    // Base64 image validation
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(imageURL)) {
      return res
        .status(400)
        .json({ message: "Invalid image format. Must be Base64 string." });
    }

    // Role validation
    if (!["super admin", "admin", "faculty"].includes(approved_by)) {
      return res.status(400).json({ message: "Invalid approver role." });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Force reconfigure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload base64 image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageURL, {
      folder: "permission_applications", // Optional: organize uploads
    });

    // Store Cloudinary image URL
    student.permissionDetails = {
      imageURL: uploadResponse.secure_url,
      remark,
      approved_by,
      uploadDate: new Date(),
    };

    await student.save();

    res.status(200).json({
      message: "Permission updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update Permission Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updatePlacementInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, salary, location, jobProfile } = req.body;

    if (!companyName || !salary || !location || !jobProfile) {
      return res
        .status(400)
        .json({
          message:
            "All fields are required: companyName, salary, location, jobProfile",
        });
    }

    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find or create company
    let company = await Company.findOne({ companyName });
    if (!company) {
      company = new Company({
        companyName,
        location,
        hrEmail: "hr@" + companyName.toLowerCase().replace(/\s+/g, "") + ".com",
      });
      await company.save();
    }

    student.placedInfo = {
      companyRef: company._id,
      companyName,
      salary,
      location,
      jobProfile,
    };

    // Update interview status from Selected to Placed (if any)
    student.PlacementinterviewRecord.forEach((interview) => {
      if (
        interview.status === "Selected" &&
        interview.companyRef &&
        interview.companyRef.toString() === company._id.toString()
      ) {
        interview.status = "Placed";
      }
    });

    await student.save();

    return res.status(200).json({
      message: "Placement information updated successfully.",
      placedInfo: student.placedInfo,
    });
  } catch (error) {
    console.error("Error updating placement info:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

exports.getStudentLevels = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const levels = student.level;
    if (!levels || levels.length === 0) {
      return res
        .status(404)
        .json({ message: "No levels found for this student" });
    }
    res.status(200).json(levels);
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.getLevelWiseStudents = async (req, res) => {
  try {
    const { levelNo } = req.params;

    const students = await AdmittedStudent.aggregate([
      {
        $match: {
          currentLevel: levelNo,
          $or: [
            { permissionDetails: { $exists: false } },
            { permissionDetails: null },
            { permissionDetails: {} },
          ],
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]);

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found for this level" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students by latest level:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updateAdmittedStudent = async (req, res) => {
  try {
    console.log("Received update request for admitted student:", req.body);

    const { prkey } = req.body;
    if (!prkey) {
      return res
        .status(400)
        .json({ message: "Admission ID (prkey) is required" });
    }

    // Define which fields you want to allow updates for
    const updateFields = {
      image: req.body.image, // Base64 Image
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      fatherName: req.body.fatherName,
 
      studentMobile: req.body.studentMobile,
      parentMobile: req.body.parentMobile,
      gender: req.body.gender,
      dob: req.body.dob,
      aadharCard: req.body.aadharCard,
      village: req.body.village,
      track: req.body.track,
      category: req.body.category,
      stream: req.body.stream,
      course: req.body.course,
      subject12: req.body.subject12,
      year12: req.body.year12,
      percent12: req.body.percent12,
      percent10: req.body.percent10,
      address: req.body.address,
    };

    // Remove undefined fields (in case partial update)
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const updatedStudent = await AdmittedStudent.findOneAndUpdate(
      { prkey }, // Match by prkey field
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Admitted student not found" });
    }

    return res.status(200).json({
      message: "Admitted student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error during admitted student update:", error);
    return res.status(500).json({
      message: "Update failed",
      error: error.message,
    });
  }
};

exports.getReadyStudent = async (req, res) => {
  try {
    // Find all students whose readinessStatus is "Ready"
    const readyStudents = await AdmittedStudent.find({
      readinessStatus: "Ready",
    }).sort({ updatedAt: -1 });

    if (readyStudents.length === 0) {
      return res
        .status(404)
        .json({ message: "No students found with readinessStatus 'Ready'." });
    }

    return res.status(200).json({
      message: "Ready students fetched successfully.",
      data: readyStudents,
    });
  } catch (error) {
    console.error("Error fetching ready students:", error);
    return res.status(500).json({
      message: "Failed to fetch ready students.",
      error: error.message,
    });
  }
};

// placement

// Schedule Interview API
exports.addInterviewRecord = async (req, res) => {
  try {
    const { studentId } = req.params;
    const {
      companyName,
      jobProfile,
      location,
      status,
      scheduleDate,
      rounds,
      offerLetterURL,
      applicationLetterURL,
    } = req.body;

    console.log("Searching for studentId:", studentId);

    // Validate required fields
    if (!companyName || !jobProfile || !scheduleDate) {
      return res
        .status(400)
        .json({
          message: "companyName, jobProfile, and scheduleDate are required.",
        });
    }

    // Find the admitted student
    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Prepare new interview record
    const newInterview = {
      companyName,
      jobProfile,
      location: location || "",
      status: status || "Scheduled",
      scheduleDate: new Date(scheduleDate),
      rounds: Array.isArray(rounds) ? rounds : [], // must be array of {roundName, date, mode, feedback, result}
      offerLetterURL: offerLetterURL || "",
      applicationLetterURL: applicationLetterURL || "",
    };

    // Push new interview into student's PlacementinterviewRecord
    student.PlacementinterviewRecord.push(newInterview);

    // Save changes
    await student.save();

    res.status(201).json({
      message: "Placement interview scheduled successfully",
      interview: newInterview,
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateInterviewRecord = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { status, remark } = req.body;

    const validStatuses = [
      "Scheduled",
      "Rescheduled",
      "Ongoing",
      "Selected",
      "RejectedByStudent",
      "RejectedByCompany",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid status is required" });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const interview = student.PlacementinterviewRecord.id(interviewId);
    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview record not found" });
    }

    interview.status = status;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Interview record updated successfully",
      data: interview,
    });
  } catch (error) {
    console.error("Update Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Ensure you have these imports at the top of your file
// const cloudinary = require('cloudinary').v2;
// const AdmittedStudent = require('../models/AdmittedStudent'); // Adjust path as needed

exports.uploadResumeBase64 = async (req, res) => {
  const { studentId, fileData } = req.body;
  let formattedFileData = fileData;

  // Force reconfigure cloudinary with current env vars
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY?.substring(0, 5) + '...',
    api_secret: process.env.CLOUDINARY_API_SECRET?.substring(0, 5) + '...'
  });
  if (!studentId || !fileData) {
    return res.status(400).json({
      success: false,
      message: "Missing studentId or fileData",
    });
  }

  // Ensure valid base64 header
  if (!fileData.startsWith("data:")) {
    formattedFileData = `data:application/pdf;base64,${fileData}`;
  }

  let uploadedFile;
  try {
    uploadedFile = await cloudinary.uploader.upload(formattedFileData, {
      folder: "student_resumes",
      resource_type: "raw",
      format: "pdf",
      filename_override: `resume_${studentId}.pdf`,
      use_filename: true,
      type: "upload",
      public_id: `resume_${studentId}_${Date.now()}`,
      access_mode: "public" // ✅ Make file publicly accessible
    });

    // Construct openable URL
    const directUrl = uploadedFile.secure_url.replace("/image/upload/", "/raw/upload/");

    // Update student record
    const updatedStudent = await AdmittedStudent.findByIdAndUpdate(
      studentId,
      {
        resumeURL: directUrl,
        resume: {
          url: directUrl,
          public_id: uploadedFile.public_id,
        },
      },
      { new: true }
    );

    if (!updatedStudent) {
      await cloudinary.uploader.destroy(uploadedFile.public_id, { resource_type: "raw" });
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: directUrl,
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error during resume upload:", error);
    if (uploadedFile) {
      try {
        await cloudinary.uploader.destroy(uploadedFile.public_id, { resource_type: "raw" });
      } catch (cleanupError) {
        console.error("Failed to cleanup orphaned file:", cleanupError);
      }
    }
    res.status(500).json({
      success: false,
      message: "An error occurred during the upload process.",
      error: error.message,
    });
  }
};




// exports.uploadResumeBase64 = async (req, res) => {
//   const { studentId, fileName, fileData } = req.body;

//   if (!studentId || !fileName || !fileData) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing studentId, fileName, or fileData"
//     });
//   }

//   try {
//     // Ensure prefix is there
//     const base64Pdf =
//       fileData.startsWith("data:application/pdf;base64,")
//         ? fileData
//         : `data:application/pdf;base64,${fileData}`;

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(base64Pdf, {
//       folder: "student_resumes",
//       resource_type: "raw",
//       public_id: `${studentId}_${Date.now()}`
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Resume uploaded successfully",
//       url: result.secure_url
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error uploading resume",
//       error: error.message
//     });
//   }
// };

//

// exports.uploadResumeBase64 = async (req, res) => {
//   const { studentId, fileName, fileData } = req.body;

//   if (!studentId || !fileName || !fileData) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing studentId, fileName, or fileData"
//     });
//   }

//   try {
//     // ✅ Ensure PDF base64 prefix
//     const base64Pdf = fileData.startsWith("data:application/pdf;base64,")
//       ? fileData
//       : `data:application/pdf;base64,${fileData}`;

//     // ✅ Upload to Cloudinary
//     // const result = await cloudinary.uploader.upload(base64Pdf, {
//     //   folder: "student_resumes",
//     //   resource_type: "raw",
//     //   public_id: `${studentId}_${Date.now()}`
//     // });

// //     const result = await cloudinary.uploader.upload(base64Pdf, {
// //   folder: "student_resumes",
// //   resource_type: "auto",   // let Cloudinary detect it’s a PDF
// //   public_id: `${studentId}_${Date.now()}`
// // });

// //     // ✅ Return URLs
// //     return res.status(200).json({
// //       success: true,
// //       message: "Resume uploaded successfully",
// //       url: result.secure_url, // original Cloudinary URL
// //       viewUrl: result.secure_url.replace("/upload/", "/upload/"), // open in browser
// //       downloadUrl: result.secure_url.replace("/upload/", "/upload/fl_attachment/") // force download
// //     });

// const result = await cloudinary.uploader.upload(base64Pdf, {
//   folder: "student_resumes",
//   resource_type: "auto",   // detect automatically (PDF will be served correctly)
//   public_id: `${studentId}_${Date.now()}`
// });

// // ✅ Return URLs
// return res.status(200).json({
//   success: true,
//   message: "Resume uploaded successfully",
//   url: result.secure_url, // direct PDF link
//   viewUrl: result.secure_url, // open in browser
//   downloadUrl: result.secure_url.replace("/upload/", "/upload/fl_attachment/") // force download
//  });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Error uploading resume",
//       error: error.message
//     });
//   }
// };

exports.generatePlacementPost = async (req, res) => {
  try {
    const { studentId, studentImageBase64, companyLogoBase64 } = req.body;

    const student = await AdmittedStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { firstName, lastName, placedInfo } = student;
    const studentName = `${firstName} ${lastName}`;

    if (!placedInfo || !placedInfo.companyName) {
      return res.status(400).json({ message: "Placement info not available" });
    }

    if (!studentImageBase64 || !companyLogoBase64) {
      return res
        .status(400)
        .json({ message: "Student image and company logo are required" });
    }

    // Paths
    const templatePath = path.join(
      __dirname,
      "../public/templates/Placement Template.jpg"
    );
    const outputFileName = `${studentName.replace(/\s+/g, "_")}_post.jpg`;
    const outputPath = path.join(
      __dirname,
      `../public/posts/${outputFileName}`
    );

    // Ensure posts directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Convert base64 to buffer
    const studentImageBuffer = Buffer.from(
      studentImageBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
      "base64"
    );
    const companyLogoBuffer = Buffer.from(
      companyLogoBase64.replace(/^data:image\/[a-z]+;base64,/, ""),
      "base64"
    );

    // Compose final image
    const finalImage = await sharp(templatePath)
      .composite([
        { input: studentImageBuffer, top: 300, left: 280 },
        { input: companyLogoBuffer, top: 620, left: 80 },
      ])
      .resize(1080, 1080)
      .jpeg()
      .toBuffer();

    fs.writeFileSync(outputPath, finalImage);

    // Send file for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${outputFileName}"`
    );
    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(outputPath);
  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateTechnology = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { techno } = req.body;

    if (!techno) {
      return res.status(400).json({ message: "Technology field is required" });
    }

    // Step 1: Fetch student
    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Step 2: Check if Level 2A is passed inside the level array
    const hasPassedLevel2A = student.level?.some(
      (lvl) => lvl.levelNo === "2A" && lvl.result === "Pass"
    );

    if (!hasPassedLevel2A) {
      return res
        .status(403)
        .json({
          message: "Student must complete Level 2A before updating technology",
        });
    }

    // ✅ Step 3: Update techno field
    student.techno = techno;
    await student.save();

    res.status(200).json({
      message: "Technology updated successfully",
      student,
    });
  } catch (error) {
    console.error("Error updating technology:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Validate base64 image format
    if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(image)) {
      return res
        .status(400)
        .json({
          message: "Invalid image format. Must be base64 encoded image.",
        });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Force reconfigure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "student_profiles",
      public_id: `student_${studentId}`,
      overwrite: true,
    });

    student.image = uploadResponse.secure_url; // Store Cloudinary URL
    await student.save();

    res.status(200).json({
      message: "Profile image updated successfully",
      student,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.rescheduleInterview = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { newDate } = req.body;

    if (!newDate) {
      return res.status(400).json({ message: "New date is required." });
    }

    const updatedStudent = await AdmittedStudent.findOneAndUpdate(
      {
        _id: studentId,
        "PlacementinterviewRecord._id": interviewId,
      },
      {
        $set: {
          "PlacementinterviewRecord.$.scheduleDate": new Date(newDate),
          "PlacementinterviewRecord.$.status": "Rescheduled",
        },
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: "Student or interview not found." });
    }

    res.status(200).json({
      message: "Interview rescheduled successfully.",
      updatedData: updatedStudent,
    });
  } catch (error) {
    console.error("Error rescheduling interview:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.updateStudentEmail = async (req, res) => {
  try {
    const { prkey, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const student = await AdmittedStudent.findOneAndUpdate(
      { prkey },
      { email },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if email already exists for another student
    const existingStudent = await AdmittedStudent.findOne({
      email,
      _id: { $ne: studentId },
    });
    if (existingStudent) {
      return res
        .status(409)
        .json({ message: "Email already exists for another student" });
    }

    student.email = email;
    await student.save();

    res.status(200).json({
      message: "Email updated successfully",
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
