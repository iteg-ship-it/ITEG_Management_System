const Department = require("../../models/department/department");

// Add Department
exports.addDepartment = async (req, res) => {
  try {
    const { departmentName, departmentCode, headOfDepartment, description } = req.body;

    if (!departmentName || !departmentCode) {
      return res.status(400).json({ message: "Department name and code are required" });
    }

    const existingDepartment = await Department.findOne({ departmentCode });
    if (existingDepartment) {
      return res.status(400).json({ message: "Department code already exists" });
    }

    const department = new Department({
      departmentName,
      departmentCode,
      headOfDepartment,
      description
    });

    await department.save();

    res.status(201).json({
      message: "Department added successfully",
      data: department
    });
  } catch (error) {
    console.error("Error adding department:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.status(200).json({ data: departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
