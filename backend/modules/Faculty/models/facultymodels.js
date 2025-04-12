const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  positionRole: { type: String, required: true, default: 'faculty' }, // camelCase
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aadharCard: { type: String, required: true, unique: true }, // camelCase
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);


module.exports = mongoose.model('Faculty', FacultySchema);
