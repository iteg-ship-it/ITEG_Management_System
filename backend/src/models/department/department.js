const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  departmentCode: { type: String, required: true, unique: true },
  headOfDepartment: { type: String, default: "" },
  description: { type: String, default: "" },
  studentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Department", DepartmentSchema);
