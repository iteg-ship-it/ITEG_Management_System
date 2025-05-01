const mongoose = require("mongoose");
// const Admin = require('../modules/Admin/models/adminmodels');

const UserSchema = new mongoose.Schema({
  position: { type: String, required: true},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  adharCard: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  department: { type: String, required: true },
  refreshToken: { type: String },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
