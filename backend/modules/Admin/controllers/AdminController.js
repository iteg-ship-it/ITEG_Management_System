const Admin = require("../models/adminModels");
const jwt = require("jsonwebtoken"); // Import JWT
const bcrypt = require('bcrypt');



require('dotenv').config();


const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, role: admin.positionRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get Single Admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Create New Adminconst jwt = require("jsonwebtoken"); // Import JWT
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, adharCard, department } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
      adharCard,
      department,
    });

    await newAdmin.save();

    // Generate JWT Token
    // const token = jwt.sign({ id: newAdmin._id, role: newAdmin.role }, process.env.JWT_SECRET, {
    //   expiresIn: "1h", // Token valid for 1 hour
    // });

    res.status(201).json({ message: "Admin created successfully!",newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};


exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(admin);

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, role, aadharCard, department } = req.body;

    // Find and update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { name, email, role, aadharCard, department },
      { new: true }
    );

    if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin updated successfully", updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
