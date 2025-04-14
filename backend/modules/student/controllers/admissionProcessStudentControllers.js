const AdmissionProcess = require('../models/admissionProcessStudent');
const bcrypt = require('bcrypt');
const path = require('path');
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


  const existingStudent = await AdmissionProcess.findOne({ prkey: payload.prkey });
    if (existingStudent) {
      // Update the existing document with new data
      console.log("✅ Updating existing student admission process data:", existingStudent);
      existingStudent.set(payload);
      await existingStudent.save();
      return res.status(200).json({ message: "Student admission updated", data: existingStudent });
    }
  const newAdmission = new AdmissionProcess(payload);

    await newAdmission.save();
    res.status(201).json({ message: "Student admission initiated", data: newAdmission });
  } catch (error) {
    res.status(400).json({ message: "Error adding admission", error });
  }
};