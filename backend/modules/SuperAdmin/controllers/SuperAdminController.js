const SuperAdmin = require('../models/SuperAdmin');
const bcrypt = require('bcrypt');
console.log(__dirname);



const jwt = require('jsonwebtoken');

require('dotenv').config();


const generateToken = (admin) => {
  return jwt.sign({ id: admin._id, role: admin.positionRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register Super Admin
exports.registerSuperAdmin = async function (req, res){
  try {
    const { name, email,  aadharCard, password } = req.body;

    // Check if Super Admin already exists
    if (await SuperAdmin.findOne({ email })) {
      return res.status(400).json({ message: 'Super Admin with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Super Admin
    const newAdmin = await SuperAdmin.create({
      name,
      email,
      aadharCard,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'Super Admin created successfully', adminId: newAdmin._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Super Admin Login
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });
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





// // Get All SuperAdmins
exports.getAllSuperAdmins = async (req, res) => {
  try {
    const Superadmins = await SuperAdmin.find().select("-password");
    res.status(200).json(Superadmins);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};








// // Get Single Admin by ID
// exports.getSuperAdminById = async (req, res) => {
//   try {
//     const Superadmin = await SuperAdmin.findById(req.params.id).select("-password");
//     if (!Superadmin) return res.status(404).json({ message: "Admin not found" });
//     res.status(200).json(Superadmin);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };


// const SuperAdmin = require("../models/SuperAdmin"); // Adjust path as needed

// Get Single SuperAdmin by ID
exports.getSuperAdminById = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.params.id).select("-password");

    console.log("Super Admin Data:", superAdmin); // ✅ Debugging line

    if (!superAdmin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(superAdmin);
  } catch (error) {
    console.error("Error fetching Super Admin:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};





