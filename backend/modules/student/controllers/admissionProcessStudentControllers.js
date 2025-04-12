const AdmissionProcess = require('../models/admissionProcessStudent');
const bcrypt = require('bcrypt');
const path = require('path');

// ✅ Add New Admission Entry
exports.addAdmission = async (req, res) => {
  try {
    const newAdmission = new AdmissionProcess(req.body);
    await newAdmission.save();
    res.status(201).json({ message: "Student admission initiated", data: newAdmission });
  } catch (error) {
    res.status(400).json({ message: "Error adding admission", error });
  }
};