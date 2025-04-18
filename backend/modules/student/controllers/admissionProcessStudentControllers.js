const AdmissionProcess = require('../models/admissionProcessStudent');
const mongoose = require('mongoose');

const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require("crypto");
 const { sendEmail } = require('./emailController');

// const axios = require('axios');
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


  const existingStudent = await AdmissionProcess.findOne({ prkey: payload.prkey });
    if (existingStudent) {
      // Update the existing document with new data
      console.log("✅ Updating existing student admission process data:", existingStudent);
      existingStudent.set(payload);
      // await existingStudent.save();
      return res.status(200).json({ message: "Student already registered", data: existingStudent });
    }
  const newAdmission = new AdmissionProcess(payload);

    await newAdmission.save();
    res.status(201).json({ message: "Student admission initiated", data: newAdmission });
  } catch (error) {
    res.status(400).json({ message: "Error adding admission", error });
  }
};

exports.createInterview = async (req, res) => {
  try {
      const { id } = req.params;  // Get student ID from URL
      const { noOfAttempts, marks, remark, date, result } = req.body;  // Extract data from request body


      // Find student by ID
      const student = await AdmissionProcess.findById(id);
      if (!student) {
          return res.status(404).json({ success: false, message: "Student not found" });
      }

      // Add new level to student's level array
      const newInterview = {
          noOfAttempts: noOfAttempts || 0,
          marks: marks || 0,
          remark: remark || "",
          date: date || new Date(),
          result: result || "Pending"
      };

      student.interviews.push(newInterview);
      await student.save();  // Save changes to database

      res.status(201).json({
          success: true,
          message: "Level added successfully",
          student
      });
  } catch (error) {
      console.error("Error adding level:", error);
      res.status(500).json({ success: false, message: "Server Error", error });
  }
};


exports.updateAdmissionFlag = async (req, res) => {
  try {
    const { id } = req.params; // MongoDB _id
    const { flag } = req.body; // Boolean value (true/false)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid student ID' });
    }

    // Update admissionFlag
    const updatedStudent = await AdmissionProcess.findByIdAndUpdate(
      id,
      { admissionStatus: flag },
      { new: true }
    ).select('+email');

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }
    console.log('Student email:', updatedStudent.email);

     // ✅ Send plain text email if admission confirmed
    if (flag === true && updatedStudent.email) {
      await sendEmail({
        to: updatedStudent.email,
        subject: 'Admission Confirmed',
        text: `Hi ${updatedStudent.firstName},\n\nYour admission has been successfully confirmed.\n\nRegards,\nAdmission Office`,
      });
    }


    return res.status(200).json({
      message: 'Admission flag updated and central system notified',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: 'Server error' });
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

