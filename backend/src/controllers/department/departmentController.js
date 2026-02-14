// ✅ Add New Department
// const express = require("express");
// const router = express.Router();
const Department = require("../models/department/department"); // adjust path if needed



exports.addDepartment = async (req, res) => {
  try {
    console.log("Received request to add department:", req.body);

    const {
      department_id,
      department_name,
      full_name,
      description,
      sub_departments
    } = req.body;

    // Optional validation
    if (!department_name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    const now = Date.now();

    const newDepartment = new Department({
      department_id,
      department_name,
      full_name,
      description,
      created_at: now,
      updated_at: now,
      sub_departments: sub_departments || []
    });

    await newDepartment.save();

    return res.status(201).json({
      message: "Department added successfully",
      data: newDepartment,
    });

  } catch (error) {
    console.error("Error adding department:", error);

    return res.status(500).json({
      message: "Failed to add department",
      error: error.message,
    });
  }
};

// Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json({ data: departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
