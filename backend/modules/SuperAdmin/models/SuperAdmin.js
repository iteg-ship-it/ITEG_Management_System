const mongoose = require('mongoose');

const superAdminSchema = new mongoose.Schema({
  positionRole: { type: String, required: true, default: 'Super Admin' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aadharCard: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('SuperAdmin', superAdminSchema);
