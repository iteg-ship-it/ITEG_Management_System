const {
  createSyllabusWithTasks,
  approveSyllabus,
  activateSyllabus,
  getSyllabusWithTaskCount
} = require("../../services/syllabusService");
const SyllabusVersion = require("../../models/syllabus/SyllabusVersion");

// ==================== CREATE SYLLABUS WITH TASKS ====================
exports.createSyllabus = async (req, res) => {
  try {
    const syllabus = await createSyllabusWithTasks(req.body);

    res.status(201).json({
      success: true,
      message: "Syllabus created successfully (draft)",
      data: syllabus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== APPROVE SYLLABUS (GENERATES TASKMASTER) ====================
exports.approveSyllabus = async (req, res) => {
  try {
    const result = await approveSyllabus(req.params.id);

    res.status(200).json({
      success: true,
      message: "Syllabus approved and TaskMaster generated",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== ACTIVATE SYLLABUS ====================
exports.activateSyllabus = async (req, res) => {
  try {
    const syllabus = await activateSyllabus(req.params.id);

    res.status(200).json({
      success: true,
      message: "Syllabus activated successfully",
      data: syllabus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET SYLLABUS WITH TASK COUNT ====================
exports.getSyllabusById = async (req, res) => {
  try {
    const result = await getSyllabusWithTaskCount(req.params.id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== GET ALL SYLLABUS ====================
exports.getAllSyllabus = async (req, res) => {
  try {
    const { sessionId, levelId, subLevelId, status } = req.query;
    
    const filter = {};
    if (sessionId) filter.sessionId = sessionId;
    if (levelId) filter.levelId = levelId;
    if (subLevelId) filter.subLevelId = subLevelId;
    if (status) filter.status = status;

    const syllabus = await SyllabusVersion.find(filter)
      .populate("sessionId levelId subLevelId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: syllabus.length,
      data: syllabus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== UPDATE SYLLABUS (ONLY DRAFT) ====================
exports.updateSyllabus = async (req, res) => {
  try {
    const syllabus = await SyllabusVersion.findById(req.params.id);
    
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found"
      });
    }

    if (syllabus.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft syllabus can be updated"
      });
    }

    Object.assign(syllabus, req.body);
    await syllabus.save();

    res.status(200).json({
      success: true,
      message: "Syllabus updated successfully",
      data: syllabus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== DELETE SYLLABUS (SOFT DELETE) ====================
exports.deleteSyllabus = async (req, res) => {
  try {
    const syllabus = await SyllabusVersion.findById(req.params.id);
    
    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found"
      });
    }

    if (syllabus.status === "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete active syllabus"
      });
    }

    syllabus.isActive = false;
    await syllabus.save();

    res.status(200).json({
      success: true,
      message: "Syllabus deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
