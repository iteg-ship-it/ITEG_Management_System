const SuperAdmin = require('../models/SuperAdmin');
const bcrypt = require('bcrypt');

// Create Super Admin
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, adharCard, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new SuperAdmin({
      name,
      email,
      adharCard,
      password: hashedPassword,
    });

    await superAdmin.save();
    res.status(201).json({ message: 'Super Admin created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
