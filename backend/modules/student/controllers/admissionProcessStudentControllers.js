const axios = require("axios");
const AdmissionProcess = require("../models/admissionProcessStudent");
const admittedStudent = require("./admittedStudentController");

const crypto = require("crypto");
require("dotenv").config();
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET; // ✅ Also load this from .env

// ✅ Add New Admission Entry
exports.addAdmission = async (req, res) => {
   try {
    const payload = req.body;

    const receivedSignature = req.headers["x-webhook-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (receivedSignature !== expectedSignature) {
      console.log("❌ Invalid Signature");
      return res.status(401).send("Unauthorized");
    }

    const existingStudent = await AdmissionProcess.findOne({
      prkey: payload.prkey,
    });
    if (existingStudent) {
      // Update the existing document with new data
      console.log(
        "✅ Updating existing student admission process data:",
        existingStudent
      );
      existingStudent.set(payload);
      // await existingStudent.save();
      return res
        .status(200)
        .json({ message: "Student already registered", data: existingStudent });
    }
    const newAdmission = new AdmissionProcess(payload);

    await newAdmission.save();
    console.log("✅ New student admission process data saved:");
    
    res
      .status(201)
      .json({ message: "Student admission initiated", data: newAdmission });
   } catch (error) {
    res.status(400).json({ message: "Error adding admission", error });
   }
};

exports.updateAdmissionFlag = async (req, res, next) => {
  try {
    const { prkey, admissionStatus } = req.body;
    // const receivedSignature = req.headers["x-webhook-signature"];

    // const expectedSignature = crypto
    //   .createHmac("sha256", WEBHOOK_SECRET)
    //   .update(JSON.stringify(req.body))
    //   .digest("hex");

    // if (receivedSignature !== expectedSignature) {
    //   console.log("❌ Invalid Signature");
    //   return res.status(401).send("Unauthorized");
    // }
   // Log the received data
    // Check if prkey and admissionStatus are provided
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

    // Step 1: Update interview flag locally
    const student = await AdmissionProcess.findByIdAndUpdate(
      studentId,
      { itegInterviewFlag: true },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Step 2: Prepare payload (only relevant fields)
    const payload = {
      prkey: student.prkey,
      itegInterviewFlag: true
    };

    // Step 3: Send POST to Central System
    const response = await axios.post('http://localhost:5001/webhook/iteg-flag-update', payload); // Replace URL

    // Step 4: Respond
    res.status(200).json({
      message: 'Interview flag updated and sent to central',
      centralResponse: response.data
    });

  } catch (err) {
    console.error('Error sending interview flag:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
