const SuperAdmin = require('../models/SuperAdmin');
const bcrypt = require('bcrypt');
console.log(__dirname);

// Get All Admins
exports.getAllSuperAdmins = async (req, res) => {
  try {
    const Superadmins = await SuperAdmin.find().select("-password");
    res.status(200).json(Superadmins);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get Single Admin by ID
exports.getSuperAdminById = async (req, res) => {
  try {
    const Superadmin = await SuperAdmin.findById(req.params.id).select("-password");
    if (!Superadmin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(Superadmin);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Create Super Admin
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, adharCard, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new SuperAdmin({
      name,
      email,
      aadharCard,
      password: hashedPassword,
    });

    await superAdmin.save();
    res.status(201).json({ message: 'Super Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
