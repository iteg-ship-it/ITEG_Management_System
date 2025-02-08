const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

// Create Super Admin
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, adharCard, password, Role,Department, } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new Admin({
      name,
      email,
      adharCard,
      password: hashedPassword,
      role,
      Department,

    });

    await superAdmin.save();
    res.status(201).json({ message: 'Super Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
