const AdmissionProcess = require("../models/admissionProcessStudent");
const AdmittedStudent = require("../models/admittedStudent");
const { sendHTMLMail } = require("./emailController");

const { sendEmail } = require('./emailController');
const cloudinary = require('backend/config/cloudinaryConfig');

const path = require('path');


const multer = require('multer');

// Multer config to hold file in memory (no disk save)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('resume');



// ✅ Create New Admitted Student (from AdmissionProcess)
exports.createAdmittedStudent = async (req, res) => {
  try {
    console.log("Received request to create admitted student:", req.body); // Important for debugging

    const admissionId = req.updatedStudent._id;

    const admissionData = await AdmissionProcess.findById(admissionId);
    console.log("Admission Data Found:", admissionData);

    if   (!admissionData || !admissionData.admissionStatus) {
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
    const students = await AdmittedStudent.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const { fullName,stream, course, fatherName, mobileNo, email, address, village, track } = req.body;
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
      Theoretical_Marks,
      Practical_Marks,
      Communication_Marks,
      marks,
      remark,
      date,
      result
    } = req.body;

    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const interviews = student.level|| [];

    const LevelOrder = ["1A", "1B", "1C", "2A", "2B", "2C"];
   


    // Find previous highest passed round
    let lastPassedRoundIndex = -1;
    for (let i = 0; i < LevelOrder.length; i++) {
      const passed = interviews.some(interview => interview.levelNo === LevelOrder[i] && interview.result === "Pass");
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
    const currentLevelAttempts = interviews.filter(i => i.levelNo === nextLevel);

    if (currentLevelAttempts.some(i => i.result === "Pass")) {
      return res.status(400).json({
        success: false,
        message: `Round ${nextLevel} already passed. Please move to next round.`,
      });
    }

    const newInterview = {
      levelNo:nextLevel,
      noOfAttempts: currentLevelAttempts.length + 1,
      Theoretical_Marks: Theoretical_Marks || 0,
      Practical_Marks: Practical_Marks || 0,
      Communication_Marks: Communication_Marks || 0,
      marks: marks || 0,
      remark: remark || "",
      date: date || new Date(),
      result: result || "Pending",
    };


     student.level.push(newInterview);

      // ✅ If the new result is "Pass", check if all levels are now passed
    if (newInterview.result === "Pass") {
      const allLevelsPassed = LevelOrder.every(level =>
        student.level.some(entry => entry.levelNo === level && entry.result === "Pass")
      );



      if (newInterview.result === "Pass" && newInterview.levelNo === "1C") {
  if (student?.email) {
    await sendHTMLMail({
      to: student.email,
      studentName: student.firstName + " " + student.lastName,
    });
    console.log("Email sent to student:", student.email);
  } else {
    console.log("❌ No email found for student:", student?.prkey || student?._id);
  }
}


     
      if (allLevelsPassed) {
        student.readinessStatus = "Ready";
      }
    }
      // // ✅ Send plain text email for result 
         if (newInterview.result === "Fail"&& student.email) {
          await sendEmail({
            to: student.email,
            subject: `Interview Result - Level  ${newInterview.levelNo}`,
            text: `Hi ${student.firstName},\n\nThank you for attending the level interview. We regret to inform you that you have not cleared the interview for Level  ${newInterview.levelNo}.

We appreciate your effort and encourage you to stay positive and keep striving for future opportunities.

Best wishes`,
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
    const students = await AdmittedStudent.find({ permissionDetails: { $ne: null } }).select('-password');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error("Get Permission Students Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a student's permissionDetails
exports.updatePermissionStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { imageURL, remark, approved_by } = req.body;

    // Base64 image validation
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(imageURL)) {
      return res.status(400).json({ message: "Invalid image format. Must be Base64 string." });
    }

    // Validate role
    if (!['super admin', 'admin', 'faculty'].includes(approved_by)) {
      return res.status(400).json({ message: "Invalid approver role." });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.permissionDetails = {
      imageURL,
      remark,
      approved_by,
      uploadDate: new Date()
    };

    await student.save();

    res.status(200).json({
      message: "Permission updated successfully",
      student
    });
  } catch (error) {
    console.error("Update Permission Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updatePlacementInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await AdmittedStudent.findById(id);
    const { companyName, salary, location, jobProfile } = req.body;
    student.placedInfo = { companyName, salary, location, jobProfile };

    await student.save();
    return res.status(200).json({
      message: "Placement information updated successfully.",
      placedInfo: student.placedInfo
    });
  } catch (error) {
    console.error("Error updating placement info:", error);
    return res.status(500).json({ message: "Server Error", error });
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
      return res.status(404).json({ message: "No levels found for this student" });
    }
    res.status(200).json(levels);
  }
  catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: "Server Error", error });
  }     
}

exports.getLevelWiseStudents = async (req, res) => {
  try {
    const { levelNo } = req.params;

    const students = await AdmittedStudent.aggregate([
      {
        $addFields: {
          latestLevel: { $arrayElemAt: ["$level", -1] }
        }
      },
      {
        $match: {
          "latestLevel.levelNo": levelNo
        }
      }
    ]);

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found for this level" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students by latest level:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update a student's permissionDetails
exports.updatePermissionStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { imageURL, remark, approved_by } = req.body;

    // Base64 image validation
    if (!/^data:image\/(png|jpeg|jpg);base64,/.test(imageURL)) {
      return res.status(400).json({ message: "Invalid image format. Must be Base64 string." });
    }

    // Validate role
    if (!['super admin', 'admin', 'faculty'].includes(approved_by)) {
      return res.status(400).json({ message: "Invalid approver role." });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.permissionDetails = {
      imageURL,
      remark,
      approved_by,
      uploadDate: new Date()
    };

    await student.save();

    res.status(200).json({
      message: "Permission updated successfully",
      student
    });
  } catch (error) {
    console.error("Update Permission Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};




exports.updateAdmittedStudent = async (req, res) => {
  try {
    console.log("Received update request for admitted student:", req.body);

    const { prkey } = req.body;
    if (!prkey) {
      return res.status(400).json({ message: "Admission ID (prkey) is required" });
    }

    // Define which fields you want to allow updates for
    const updateFields = {
      image: req.body.image, // Base64 Image
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      fatherName: req.body.fatherName,
      email: req.body.email,
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
    Object.keys(updateFields).forEach(key => {
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
    const readyStudents = await AdmittedStudent.find({ readinessStatus: 'Ready' });

    if (readyStudents.length === 0) {
      return res.status(404).json({ message: "No students found with readinessStatus 'Ready'." });
    }

    return res.status(200).json({
      message: 'Ready students fetched successfully.',
      data: readyStudents,
    });

  } catch (error) {
    console.error("Error fetching ready students:", error);
    return res.status(500).json({
      message: 'Failed to fetch ready students.',
      error: error.message,
    });
  }
};




// placement

exports.addInterviewRecord = async (req, res) => {
  try {
    const studentId = req.params.id;
    const newInterview = req.body;

    const student = await AdmittedStudent.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (student.readinessStatus !== "Ready") {
      return res.status(400).json({ success: false, message: "Student is not eligible for interview. Status: Not Ready" });
    }

    student.interviewRecord.push(newInterview);
    await student.save();

    res.status(201).json({ success: true, message: "Interview record added", data: student.interviewRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};



exports.updateInterviewRecord = async (req, res) => {
  try {
    const { studentId, interviewId } = req.params;
    const { remark, result } = req.body;

    const validResults = ['Selected', 'Rejected', 'Pending'];
    if (result && !validResults.includes(result)) {
      return res.status(400).json({ success: false, message: "Invalid result value" });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const interview = student.interviewRecord.id(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: "Interview record not found" });
    }

    if (remark !== undefined) interview.remark = remark;
    if (result !== undefined) interview.result = result;

    await student.save();

    res.status(200).json({
      success: true,
      message: "Interview record updated successfully",
      data: interview
    });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};






// Upload from Base64 encoded string via JSON
exports.uploadResumeBase64 = async (req, res) => {
  const { studentId, fileName, fileData } = req.body;

  if (!studentId || !fileName || !fileData) {
    return res.status(400).json({
      success: false,
      message: "Missing studentId, fileName, or fileData"
    });
  }

  try {
    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Upload to Cloudinary
    const cloudinaryUpload = await cloudinary.uploader.upload(`data:application/pdf;base64,${fileData}`,  {
      folder: 'student-resumes',
      resource_type: 'raw',
      public_id: Date.now() + '-' + fileName.split('.')[0]
    });

    student.resumeURL = cloudinaryUpload.secure_url;
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeURL: cloudinaryUpload.secure_url
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};


// exports.generatePlacementPost = async (req, res) => {
//   try {
//     const { studentId } = req.body;

//     const student = await AdmittedStudent.findById(studentId);
//     if (!student) return res.status(404).json({ message: 'Student not found' });

//     const {
//       name: studentName,
//       profilePhoto,
//       location: studentLocation,
//       placedInfo
//     } = student;

//     if (!placedInfo || !placedInfo.companyName) {
//       return res.status(400).json({ message: 'Placement info not available' });
//     }

//     const {
//       companyName,
//       salary,
//       location: companyLocation,
//       jobProfile,
//       companyLogo,
//       jobType
//     } = placedInfo;

//     // Paths
//     const templatePath = path.join(__dirname, '../public/templates/Placement Template.jpg');
//     const studentImgPath = path.join(__dirname, `../public/uploads/${path.basename(profilePhoto)}`);
//     const companyLogoPath = path.join(__dirname, `../public/uploads/${path.basename(companyLogo)}`);
//     const outputFileName = `${studentName.replace(/\s+/g, '_')}_post.jpg`;
//     const outputPath = path.join(__dirname, `../public/posts/${outputFileName}`);

//     // Compose the final image
//     const finalImage = await sharp(templatePath)
//       .composite([
//         { input: studentImgPath, top: 300, left: 280 }, // Adjust positions
//         { input: companyLogoPath, top: 620, left: 80 }
//       ])
//       .resize(1080, 1080)
//       .jpeg()
//       .toBuffer();

//     fs.writeFileSync(outputPath, finalImage);

//     res.status(200).json({
//       message: 'Post generated successfully',
//       imageUrl: `/posts/${outputFileName}`,
//       student: studentName,
//       company: companyName
//     });

//   } catch (error) {
//     console.error("Error generating post:", error);
//     res.status(500).json({ message: 'Server error', error });
//   }
// };


exports.generatePlacementPost = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await AdmittedStudent.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const {
      name: studentName,
      profilePhoto,
      location: studentLocation,
      placedInfo
    } = student;

    if (!placedInfo || !placedInfo.companyName) {
      return res.status(400).json({ message: 'Placement info not available' });
    }

    const {
      companyName,
      salary,
      location: companyLocation,
      jobProfile,
      companyLogo,
      jobType
    } = placedInfo;

    // ✅ Validate photo paths
    if (!profilePhoto || !companyLogo) {
      return res.status(400).json({ message: 'Student or company image is missing.' });
    }

    // Paths
    const templatePath = path.join(__dirname, '../public/templates/Placement Template.jpg');
    const studentImgPath = path.join(__dirname, `../public/uploads/${path.basename(profilePhoto)}`);
    const companyLogoPath = path.join(__dirname, `../public/uploads/${path.basename(companyLogo)}`);
    const outputFileName = `${studentName.replace(/\s+/g, '_')}_post.jpg`;
    const outputPath = path.join(__dirname, `../public/posts/${outputFileName}`);

    // Compose final image
    const finalImage = await sharp(templatePath)
      .composite([
        { input: studentImgPath, top: 300, left: 280 },
        { input: companyLogoPath, top: 620, left: 80 }
      ])
      .resize(1080, 1080)
      .jpeg()
      .toBuffer();

    fs.writeFileSync(outputPath, finalImage);

    // res.status(200).json({
    //   message: 'Post generated successfully',
    //   imageUrl: `/posts/${outputFileName}`,
    //   student: studentName,
    //   company: companyName
    // });

    

  } catch (error) {
    console.error("Error generating post:", error);
    res.status(500).json({ message: 'Server error', error });
  }

  res.status(200).json({
  message: 'Post generated successfully',
  imageUrl: `/posts/${outputFileName}`,
  downloadUrl: `/download-post/${outputFileName}`, // 👈 New endpoint
  student: studentName,
  company: companyName
});
};
