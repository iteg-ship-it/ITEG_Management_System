const Permission = require("../models/user/permission");

// Middleware to check specific page permissions
const checkPermission = (page, action = 'view') => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // SuperAdmin always has access to everything
      if (userRole === 'superadmin') {
        return next();
      }
      
      // Get user permissions from database
      const userPermissions = await Permission.findOne({ userId });
      
      if (!userPermissions) {
        return res.status(403).json({ 
          message: "Access denied. No permissions found for this user." 
        });
      }

      // Check if user has the required permission
      const hasPermission = userPermissions.permissions[page]?.[action];
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Access denied. You don't have ${action} permission for ${page}.` 
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

// Middleware to check multiple permissions (OR logic)
const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // SuperAdmin always has access to everything
      if (userRole === 'superadmin') {
        return next();
      }
      
      const userPermissions = await Permission.findOne({ userId });
      
      if (!userPermissions) {
        return res.status(403).json({ 
          message: "Access denied. No permissions found for this user." 
        });
      }

      // Check if user has any of the required permissions
      const hasAnyPermission = permissions.some(({ page, action }) => 
        userPermissions.permissions[page]?.[action]
      );
      
      if (!hasAnyPermission) {
        return res.status(403).json({ 
          message: "Access denied. Insufficient permissions." 
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

module.exports = {
  checkPermission,
  checkAnyPermission
};