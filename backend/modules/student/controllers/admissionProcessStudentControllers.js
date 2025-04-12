const Student_Admission_process = require('../models/admissionProcessStudent');
const bcrypt = require('bcrypt');
const os = require('os'); // Get user home directory
const path = require('path');
const fs = require('fs');

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