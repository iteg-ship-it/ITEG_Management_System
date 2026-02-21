// ✅ Add New Department
// const express = require("express");
// const router = express.Router();
const Department = require("../models/department/department"); // adjust path if needed



exports.addDepartment = async (req, res) => {
  try {
<<<<<<< HEAD
    console.log("Received request to add department:", req.body);
=======
    const { departmentName, departmentCode, headOfDepartment, description, status } = req.body;
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

    const {
      department_id,
      department_name,
      full_name,
      description,
      sub_departments
    } = req.body;

    // Optional validation
    if (!department_name) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    const now = Date.now();

<<<<<<< HEAD
    const newDepartment = new Department({
      department_id,
      department_name,
      full_name,
      description,
      created_at: now,
      updated_at: now,
      sub_departments: sub_departments || []
=======
    const department = new Department({
      departmentName,
      departmentCode,
      headOfDepartment,
      description,
      status: status !== undefined ? status : true
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
    });

    await newDepartment.save();

    return res.status(201).json({
      message: "Department added successfully",
      data: newDepartment,
    });

  } catch (error) {
    console.error("Error adding department:", error);

    return res.status(500).json({
      message: "Failed to add department",
      error: error.message,
    });
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

// Add Subdepartment
exports.addSubdepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { subdepartmentName, description, status } = req.body;

    if (!subdepartmentName) {
      return res.status(400).json({ message: "Subdepartment name is required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = {
      subdepartmentName,
      description,
      status: status || "Active"
    };

    department.subdepartments.push(subdepartment);
    await department.save();

    res.status(201).json({
      message: "Subdepartment added successfully",
      data: department
    });
  } catch (error) {
    console.error("Error adding subdepartment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Subdepartment
exports.updateSubdepartment = async (req, res) => {
  try {
    const { departmentId, subdepartmentId } = req.params;
    const { subdepartmentName, description, status } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    subdepartment.subdepartmentName = subdepartmentName;
    subdepartment.description = description;
    subdepartment.status = status;

    await department.save();

    res.status(200).json({
      message: "Subdepartment updated successfully",
      data: department
    });
  } catch (error) {
    console.error("Error updating subdepartment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Subdepartment
exports.deleteSubdepartment = async (req, res) => {
  try {
    const { departmentId, subdepartmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    department.subdepartments.pull(subdepartmentId);
    await department.save();

    res.status(200).json({
      message: "Subdepartment deleted successfully",
      data: department
    });
  } catch (error) {
    console.error("Error deleting subdepartment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add Level
exports.addLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId } = req.params;
    const { levelName, duration, status } = req.body;

    if (!levelName) {
      return res.status(400).json({ message: "Level name is required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    subdepartment.levels.push({ 
      levelName, 
      duration: duration || "",
      status: status || "Active",
      subLevels: []
    });
    await department.save();

    res.status(201).json({
      message: "Level added successfully",
      data: department
    });
  } catch (error) {
    console.error("Error adding level:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Level
exports.updateLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId, levelId } = req.params;
    const { levelName, duration, status } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    const level = subdepartment.levels.id(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    level.levelName = levelName;
    level.duration = duration;
    level.status = status;

    await department.save();

    res.status(200).json({
      message: "Level updated successfully",
      data: department
    });
  } catch (error) {
    console.error("Error updating level:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Level
exports.deleteLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId, levelId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    subdepartment.levels.pull(levelId);
    await department.save();

    res.status(200).json({
      message: "Level deleted successfully",
      data: department
    });
  } catch (error) {
    console.error("Error deleting level:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const { departmentName, departmentCode, headOfDepartment, description } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { departmentName, departmentCode, headOfDepartment, description },
=======
    const { departmentName, departmentCode, headOfDepartment, description, status } = req.body;

    const department = await Department.findByIdAndUpdate(
      id,
      { departmentName, departmentCode, headOfDepartment, description, status },
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      data: department
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Subdepartments by Department
exports.getSubdepartmentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      data: department.subdepartments
    });
  } catch (error) {
    console.error("Error fetching subdepartments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Levels by Subdepartment
exports.getLevelsBySubdepartment = async (req, res) => {
  try {
    const { departmentId, subdepartmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    res.status(200).json({
      data: subdepartment.levels
    });
  } catch (error) {
    console.error("Error fetching levels:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add SubLevel
exports.addSubLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId, levelId } = req.params;
    const { subLevelName, description, status } = req.body;

    if (!subLevelName) {
      return res.status(400).json({ message: "SubLevel name is required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    const level = subdepartment.levels.id(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    level.subLevels.push({ 
      subLevelName, 
      description: description || "",
      status: status || "Active"
    });
    await department.save();

    res.status(201).json({
      message: "SubLevel added successfully",
      data: department
    });
  } catch (error) {
    console.error("Error adding sublevel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update SubLevel
exports.updateSubLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId, levelId, subLevelId } = req.params;
    const { subLevelName, description, status } = req.body;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    const level = subdepartment.levels.id(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    const subLevel = level.subLevels.id(subLevelId);
    if (!subLevel) {
      return res.status(404).json({ message: "SubLevel not found" });
    }

    subLevel.subLevelName = subLevelName;
    subLevel.description = description;
    subLevel.status = status;

    await department.save();

    res.status(200).json({
      message: "SubLevel updated successfully",
      data: department
    });
  } catch (error) {
    console.error("Error updating sublevel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete SubLevel
exports.deleteSubLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId, levelId, subLevelId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    const level = subdepartment.levels.id(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    level.subLevels.pull(subLevelId);
    await department.save();

    res.status(200).json({
      message: "SubLevel deleted successfully",
      data: department
    });
  } catch (error) {
    console.error("Error deleting sublevel:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get SubLevels by Level
exports.getSubLevelsByLevel = async (req, res) => {
  try {
    const { departmentId, subdepartmentId, levelId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const subdepartment = department.subdepartments.id(subdepartmentId);
    if (!subdepartment) {
      return res.status(404).json({ message: "Subdepartment not found" });
    }

    const level = subdepartment.levels.id(levelId);
    if (!level) {
      return res.status(404).json({ message: "Level not found" });
    }

    res.status(200).json({
      data: level.subLevels
    });
  } catch (error) {
    console.error("Error fetching sublevels:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json({
      message: "Department deleted successfully",
      data: department
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
