const axios = require("axios");
const AdmissionProcess = require("../models/admissionProcessStudent");
const admittedStudent = require("./AdmittedStudentController");

const crypto = require("crypto");
 const { sendEmail } = require('./emailController');
//  console.log('Student email:', updatedStudent.email);


// const axios = require('axios');
require("dotenv").config();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET; // ✅ Also load this from .env

exports.addAdmission = async (req, res) => {
  
  try {
    const payload = req.body;

    // 1) Check required fields
    const requiredFields = [
      'prkey','firstName','lastName','fatherName',
      'studentMobile','gender',
      'address','village','stream','course',
      'category','subject12','percent10'
    ];
    for (let field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({ message: `Missing field: ${field}` });
      }
    }

    // 2) Validate date format
    // if (isNaN(Date.parse(payload.dob))) {
    //   return res.status(400).json({ message: 'Invalid date format' });
    // }

    // 3) Validate mobile & aadhar format
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(payload.studentMobile) || !mobileRegex.test(payload.parentMobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }
    // const aadharRegex = /^\d{12}$/;
    // if (!aadharRegex.test(payload.aadharCard)) {
    //   return res.status(400).json({ message: 'Invalid aadhaar format' });
    // }

    // 4) Duplicate check
    const existingStudent = await AdmissionProcess.findOne({ prkey: payload.prkey });
    if (existingStudent) {
      existingStudent.set(payload);
      return res.status(200).json({ message: 'Student already registered', data: existingStudent });
    }

    // 5) Save new
    const newAdmission = new AdmissionProcess(payload);
    await newAdmission.save();
    console.log("✅ New student admission process data saved:");
    return res.status(201).json({ message: 'Student admission initiated', data: newAdmission });

  } catch (error) {
    return res.status(500).json({ message: 'Error adding admission', error: error.message });
  }
};


exports.updateAdmissionFlag = async (req, res, next) => {
  try {
    const { prkey, admissionStatus } = req.body;

    if (!prkey || !admissionStatus) {
      return res.status(400).json({
        message: "Both prkey and admissionStatus are required",
      });
    }
    // Find the student by prkey and update the admissionStatus
    const updatedStudent = await AdmissionProcess.findOneAndUpdate(
      { prkey},
      { admissionStatus },
      { new: true }
    );
    // console.log(updatedStudent);
    

    if (!updatedStudent) {
      return res
        .status(404)
        .json({ message: "Student not found with the provided prkey" });
    }
         req.updatedStudent = updatedStudent;


         // // ✅ Send plain text email if admission confirmed
         if (admissionStatus === true && updatedStudent.email) {
          await sendEmail({
            to: updatedStudent.email,
            subject: 'Admission Confirmed',
            text: `Hi ${updatedStudent.firstName},\n\nYour admission has been successfully confirmed.\n\nRegards,\nAdmission Office`,
          });
         }
    // Now move to next controller
    next();
    // Call the next middleware or route handler
  } catch (error) {
    console.error("❌ Error updating admissionStatus:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


// update the itegIntervieFlag 
exports.sendInterviewFlagToCentral = async (req, res) => {
  
  try {
    const { studentId } = req.params;
    // 0) Validate input
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }
    if(AdmissionProcess.status==="Active"){
    // 1) Update interview flag locally
    const student = await AdmissionProcess.findByIdAndUpdate(
      studentId,
      { itegInterviewFlag: true },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

   
     // // ✅ Send plain text email if admission confirmed


    // Step 2: Prepare payload (only relevant fields)
    const payload = {
      prkey: student.prkey,
      itegInterviewFlag: true
    };
    if (student.itegInterviewFlag === true && student.email) {
      await sendEmail({
        to: student.email,
        subject: 'Admission Confirmed',
        text: `Hi ${student.firstName},\n\n Now you are eligible.\n\nRegards,\nAdmission Office`,
      });
    }
    // Step 3: Send POST to Central System
     const response = await axios.post('http://localhost:5001/webhook/iteg-flag-update', payload); // Replace URL

    // 4) Return success
    return res.status(200).json({
      message: 'Interview flag updated and sent to central',
      centralResponse: response.data
    });
  } else {
    return res.status(400).json({
      message: 'Student is not active, cannot update interview flag',
    });
  }

} catch (err) {
  console.error("❌ Full error:", err);

  if (err.response) {
    console.error("❌ Axios Error Response:", err.response.data);
    return res.status(500).json({
      message: "Server error (from central system)",
      error: err.response.data,
    });
  }

  return res.status(500).json({
    message: "Server error",
    error: err.message || err.stack || JSON.stringify(err),
  });
}

};


exports.createInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { round,communication,confidence,goal,subjectKnowlage,technical,sincerity,  maths,reasoning, marks, remark, date, result } = req.body;

    const student = await AdmissionProcess.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const interviews = student.interviews || [];

    // Round Order (you can add more later)
    const roundOrder = ["First", "Second"];

    const requestedRoundIndex = roundOrder.indexOf(round);
    if (requestedRoundIndex === -1) {
      return res.status(400).json({ success: false, message: "Invalid round name" });
    }

    // Find all interviews of current requested round
    const currentRoundAttempts = interviews.filter(i => i.round === round);

    // Find highest round passed
    let lastPassedRoundIndex = -1;
    for (let i = 0; i < roundOrder.length; i++) {
      const passed = interviews.some(interview => interview.round === roundOrder[i] && interview.result === "Pass");
      if (passed) {
        lastPassedRoundIndex = i;
      } else {
        break;
      }
    }

    // 🚫 If trying to attempt a new round without passing previous one
    if (requestedRoundIndex > lastPassedRoundIndex + 1) {
      return res.status(400).json({
        success: false,
        message: `You must pass ${roundOrder[lastPassedRoundIndex + 1] || 'previous round'} before proceeding to ${round}.`
      });
    }

    // 🚫 If 4 attempts already done without passing, student is rejected
    if (currentRoundAttempts.length >= 4 && !currentRoundAttempts.some(i => i.result === "Pass")) {
      return res.status(400).json({
        success: false,
        message: `Student rejected after 4 failed attempts in ${round} round.`,
      });
    }

    // 🚫 If already passed the current round
    if (currentRoundAttempts.some(i => i.result === "Pass")) {
      return res.status(400).json({
        success: false,
        message: `Round ${round} already passed. Please move to next round.`,
      });
    }


    const newInterview = {
      round: round || "First",
      communication:communication || 0,
      confidence:confidence || 0,
      goal:goal || 0,
      subjectKnowlage:subjectKnowlage|| 0,
      technical:technical || 0,
      sincerity:sincerity || 0,
      maths:maths || 0,
      reasoning:reasoning || 0,
      attemptNo: currentRoundAttempts.length + 1, // Auto-increment attemptNo
      marks: marks || 0,
      remark: remark || "",
      date: date || new Date(),
      // created_by:Faculty||Faculty,
      result: result || "Pending",
    };

    student.interviews.push(newInterview);
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



exports.getInterviewsByStudentId = async (req, res) => {
  try {
    const { id } = req.params;

    // Find student by ID
    const student = await AdmissionProcess.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Return only interviews array
    res.status(200).json({
      success: true,
      interviews: student.interviews
    });

  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await AdmissionProcess.find(); // fetch all student records
    res.status(200).json(students); // send as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve students', error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await AdmissionProcess.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student fetched successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error fetching student by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};