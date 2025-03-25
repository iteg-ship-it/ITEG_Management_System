const Faculty = require('../models/facultymodels');
const bcrypt = require('bcrypt');

// Get All Faculties
exports.getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().select('-password');
    res.status(200).json(faculties);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Get Single Faculty by ID
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).select('-password');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Create Faculty
exports.createFaculty = async (req, res) => {
  try {
    const { name, email, aadharCard, password, role, department } = req.body;

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ message: "Faculty already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new faculty
    const newFaculty = new Faculty({
      name,
      email,
      aadharCard,
      password: hashedPassword,
      role,
      department,
    });

    await newFaculty.save();
    res.status(201).json({ message: 'Faculty created successfully' });
  } catch (error) {
    console.error("Create Faculty Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Update Faculty
exports.updateFaculty = async (req, res) => {
  try {
    const { name, email, role, aadharCard, department } = req.body;

    // Find and update faculty
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, email, role, aadharCard, department },
      { new: true }
    );
    
    if (!updatedFaculty) return res.status(404).json({ message: 'Faculty not found' });

    res.status(200).json({ message: 'Faculty updated successfully', updatedFaculty });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

// Delete Faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!deletedFaculty) return res.status(404).json({ message: 'Faculty not found' });

    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};
