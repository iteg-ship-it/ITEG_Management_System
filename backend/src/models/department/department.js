const mongoose = require("mongoose");

const SubLevelSchema = new mongoose.Schema({
  subLevelName: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now }
});

const LevelSchema = new mongoose.Schema({
  levelName: { type: String, required: true },
  duration: { type: String, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  subLevels: [SubLevelSchema],
  createdAt: { type: Date, default: Date.now }
});

const SubdepartmentSchema = new mongoose.Schema({
  subdepartmentName: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  levels: [LevelSchema],
  createdAt: { type: Date, default: Date.now }
});

const DepartmentSchema = new mongoose.Schema({
  departmentName: { type: String, required: true },
  departmentCode: { type: String, required: true, unique: true },
  headOfDepartment: { type: String, default: "" },
  description: { type: String, default: "" },
  studentCount: { type: Number, default: 0 },
  subdepartments: [SubdepartmentSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Department", DepartmentSchema);
