const Session = require("../models/Session");

// Create Session
exports.createSession = async (req, res) => {
  try {
    // Validate required fields
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Validate name format (basic validation for session names)
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Session name must be a valid non-empty string"
      });
    }

    const session = await Session.create(req.body);
    
    res.status(201).json({
      success: true,
      message: "Session created successfully",
      data: session
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Session with this name already exists"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Sessions
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true })
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Session by ID
exports.getSessionById = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format"
      });
    }

    const session = await Session.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update Session
exports.updateSession = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format"
      });
    }

    // Validate name if being updated
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Session name must be a valid non-empty string"
        });
      }
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Session updated successfully",
      data: session
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Session with this name already exists"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Session (soft delete)
exports.deleteSession = async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID format"
      });
    }

    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Session deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};