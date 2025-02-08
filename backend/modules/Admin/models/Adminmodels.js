const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  positionRole: { type: String, required: true, default: 'Admin' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  adharCard: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:{type:String,requested:true},
  Department:{type:String,request:true},
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
