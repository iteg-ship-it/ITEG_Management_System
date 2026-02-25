const SubLevel = require("../models/SubLevel");
const Level = require("../models/Level");

// Create SubLevel
exports.createSubLevel = async (req, res) => {
  try {
    // Validate required fields
    const { name, order, levelId } = req.body;
    if (!name || !order || !levelId) {
      return res.status(400).json({
        success: false,
        message: "Name, order, and levelId are required"
      });
    }

    // Validate levelId format
    if (!levelId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid levelId format"
      });
    }

    // Check if level exists and is active
    const level = await Level.findOne({ 
      _id: levelId, 
      isActive: true 
    });
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: "Level not found"
      });
    }

    const subLevel = await SubLevel.create(req.body);
    const populatedSubLevel = await SubLevel.findById(subLevel._id).populate('levelId');
    
    res.status(201).json({
      success: true,
      message: "SubLevel created successfully",
      data: populatedSubLevel
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SubLevel with this order already exists for this level"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get SubLevels by Level
exports.getSubLevelsByLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    
    // Validate ObjectId format
    if (!levelId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid level ID format"
      });
    }
    
    const subLevels = await SubLevel.find({ 
      levelId, 
      isActive: true 
    }).populate('levelId').sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: subLevels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get All SubLevels
exports.getAllSubLevels = async (req, res) => {
  try {
    const subLevels = await SubLevel.find({ isActive: true })
      .populate('levelId')
      .sort({ levelId: 1, order: 1 });
      
    res.status(200).json({
      success: true,
      data: subLevels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get SubLevel by ID
exports.getSubLevelById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sublevel ID format"
      });
    }

    const subLevel = await SubLevel.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('levelId');
    
    if (!subLevel) {
      return res.status(404).json({
        success: false,
        message: "SubLevel not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: subLevel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update SubLevel
exports.updateSubLevel = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sublevel ID format"
      });
    }

    // If levelId is being updated, validate it
    if (req.body.levelId) {
      if (!req.body.levelId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: "Invalid levelId format"
        });
      }

      // Check if level exists and is active
      const level = await Level.findOne({ 
        _id: req.body.levelId, 
        isActive: true 
      });
      
      if (!level) {
        return res.status(404).json({
          success: false,
          message: "Level not found"
        });
      }
    }

    const subLevel = await SubLevel.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    ).populate('levelId');
    
    if (!subLevel) {
      return res.status(404).json({
        success: false,
        message: "SubLevel not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "SubLevel updated successfully",
      data: subLevel
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SubLevel with this order already exists for this level"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete SubLevel (soft delete)
exports.deleteSubLevel = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sublevel ID format"
      });
    }

    const subLevel = await SubLevel.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    if (!subLevel) {
      return res.status(404).json({
        success: false,
        message: "SubLevel not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "SubLevel deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};