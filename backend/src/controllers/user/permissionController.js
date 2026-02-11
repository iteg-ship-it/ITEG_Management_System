const Permission = require("../../models/user/permission");
const User = require("../../models/user/user");

// Default permissions based on role
const getDefaultPermissions = (role) => {
  const basePermissions = {
    dashboard: { view: false, edit: false, add: false, delete: false },
    attendanceDetails: { view: false, edit: false, add: false, delete: false },
    admissionProcess: { view: false, edit: false, add: false, delete: false },
    admissionEditPage: { view: false, edit: false, add: false, delete: false },
    studentDashboard: { view: false, edit: false, add: false, delete: false },
    studentDetailTable: { view: false, edit: false, add: false, delete: false },
    studentEditPage: { view: false, edit: false, add: false, delete: false },
    studentProfile: { view: false, edit: false, add: false, delete: false },
    studentReport: { view: false, edit: false, add: false, delete: false },
    studentReportForm: { view: false, edit: false, add: false, delete: false },
    studentLevelData: { view: false, edit: false, add: false, delete: false },
    studentLevelInterviewHistory: { view: false, edit: false, add: false, delete: false },
    studentPermission: { view: false, edit: false, add: false, delete: false },
    placementReadyStudents: { view: false, edit: false, add: false, delete: false },
    placementRecords: { view: false, edit: false, add: false, delete: false },
    placementPost: { view: false, edit: false, add: false, delete: false },
    companyDetail: { view: false, edit: false, add: false, delete: false },
    placedStudents: { view: false, edit: false, add: false, delete: false },
    interviewHistory: { view: false, edit: false, add: false, delete: false },
    interviewRoundsHistory: { view: false, edit: false, add: false, delete: false },
    usersManagement: { view: false, edit: false, add: false, delete: false },
    userProfile: { view: false, edit: false, add: false, delete: false },
    permissionManagement: { view: false, edit: false, add: false, delete: false }
  };

  if (role === 'superadmin') {
    Object.keys(basePermissions).forEach(key => {
      basePermissions[key] = { view: true, edit: true, add: true, delete: true };
    });
  } else if (role === 'admin') {
    const adminAccess = ['dashboard', 'attendanceDetails', 'admissionProcess', 'studentDashboard', 'studentDetailTable', 'studentProfile', 'studentReport', 'placementReadyStudents', 'placementRecords'];
    adminAccess.forEach(key => {
      basePermissions[key] = { view: true, edit: true, add: true, delete: false };
    });
  } else if (role === 'faculty') {
    const facultyAccess = ['dashboard', 'attendanceDetails', 'studentProfile', 'studentReport'];
    facultyAccess.forEach(key => {
      basePermissions[key] = { view: true, edit: false, add: false, delete: false };
    });
  }

  return basePermissions;
};

// Create or update user permissions
exports.createOrUpdatePermissions = async (req, res) => {
  try {
    const userId = req.body.userId || req.params.userId;
    const { permissions } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userPermission = await Permission.findOne({ userId });

    if (userPermission) {
      userPermission.permissions = permissions;
      userPermission.updatedAt = new Date();
      await userPermission.save();
    } else {
      userPermission = new Permission({
        userId,
        role: user.role,
        permissions
      });
      await userPermission.save();
    }

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      permissions: userPermission
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user permissions
const getCurrentUserPermissions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get permissions or create default ones
    let permissions = await Permission.findOne({ userId });
    
    if (!permissions) {
      // Create default permissions based on user role
      const defaultPermissions = getDefaultPermissions(user.role);
      permissions = new Permission({
        userId,
        role: user.role,
        permissions: defaultPermissions
      });
      await permissions.save();
    }

    res.status(200).json({
      success: true,
      permissions: permissions.permissions,
      role: permissions.role
    });
  } catch (error) {
    console.error("Error getting current user permissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user permissions
exports.getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    let userPermission = await Permission.findOne({ userId }).populate('userId', 'name email role');

    if (!userPermission) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create default permissions
      const defaultPermissions = getDefaultPermissions(user.role);
      userPermission = new Permission({
        userId,
        role: user.role,
        permissions: defaultPermissions
      });
      await userPermission.save();
    }

    res.status(200).json({
      success: true,
      permissions: userPermission
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update specific permission
exports.updateSpecificPermission = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, action, value } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get or create permissions
    let permissions = await Permission.findOne({ userId });
    
    if (!permissions) {
      const defaultPermissions = getDefaultPermissions(user.role);
      permissions = new Permission({
        userId,
        role: user.role,
        permissions: defaultPermissions
      });
    }

    // Update specific permission
    if (permissions.permissions[page]) {
      permissions.permissions[page][action] = value;
      permissions.updatedAt = new Date();
      await permissions.save();

      res.status(200).json({
        success: true,
        message: `${action} permission for ${page} updated successfully`,
        permissions: permissions.permissions
      });
    } else {
      res.status(400).json({ message: "Invalid page or action" });
    }
  } catch (error) {
    console.error("Error updating specific permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Initialize permissions for existing users
exports.initializePermissions = async (req, res) => {
  try {
    const users = await User.find({});
    let created = 0;

    for (const user of users) {
      const existingPermission = await Permission.findOne({ userId: user._id });
      
      if (!existingPermission) {
        const defaultPermissions = getDefaultPermissions(user.role);
        await Permission.create({
          userId: user._id,
          role: user.role,
          permissions: defaultPermissions
        });
        created++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Initialized permissions for ${created} users`
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users with their permissions
exports.getAllUsersWithPermissions = async (req, res) => {
  try {
    const permissions = await Permission.find({}).populate('userId', 'name email role position department');
    
    res.status(200).json({
      success: true,
      permissions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user permissions
exports.getCurrentUserPermissions = async (req, res) => {
  try {
    const userId = req.user.id;

    let userPermission = await Permission.findOne({ userId }).populate('userId', 'name email role');

    if (!userPermission) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create default permissions
      const defaultPermissions = getDefaultPermissions(user.role);
      userPermission = new Permission({
        userId,
        role: user.role,
        permissions: defaultPermissions
      });
      await userPermission.save();
    }

    res.status(200).json({
      success: true,
      permissions: userPermission
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};