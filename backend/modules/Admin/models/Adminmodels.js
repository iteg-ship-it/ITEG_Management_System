const mongoose = require('mongoose');
// const Admin = require('../modules/Admin/models/adminmodels');

const AdminSchema = new mongoose.Schema({
  positionRole: { type: String, required: true, default: 'Admin' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  adharCard: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin', immutable: true },
  department: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
