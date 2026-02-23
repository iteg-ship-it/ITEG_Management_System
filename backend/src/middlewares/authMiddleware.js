const jwt = require("jsonwebtoken");
const User = require('../models/user/user');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ 
            message: "Access Denied. No token provided.",
            code: "NO_TOKEN"
        });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(401).json({ 
            message: "Access Denied. No token provided.",
            code: "INVALID_TOKEN_FORMAT"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user still exists and is active
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                message: "User not found or inactive",
                code: "USER_INACTIVE"
            });
        }
        
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            department: user.department
        };
        
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expired",
                code: "TOKEN_EXPIRED"
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid token",
                code: "INVALID_TOKEN"
            });
        }
        return res.status(401).json({ 
            message: "Token verification failed",
            code: "TOKEN_VERIFICATION_FAILED"
        });
    }
};

// Alternative name for compatibility
const authenticateToken = verifyToken;

// Enhanced role checking with detailed permissions
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                message: "Authentication required",
                code: "AUTH_REQUIRED"
            });
        }
        
        const userRole = req.user.role?.toLowerCase();
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        const normalizedRoles = allowedRoles.map(role => role.toLowerCase());
        
        if (!normalizedRoles.includes(userRole)) {
            // Log unauthorized access attempt
            console.warn(`Unauthorized access attempt: ${req.user.email} (${userRole}) tried to access ${req.method} ${req.originalUrl}`);
            
            return res.status(403).json({ 
                message: "Access Denied. Insufficient permissions.",
                code: "INSUFFICIENT_PERMISSIONS",
                userRole: userRole,
                requiredRoles: allowedRoles
            });
        }
        
        next();
    };
};

// Middleware to check if user owns the resource or has admin privileges
const checkOwnershipOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.id || req.params.userId;
    const currentUserId = req.user.id;
    const userRole = req.user.role?.toLowerCase();
    
    // Allow if user is admin/superadmin or accessing their own resource
    if (['admin', 'superadmin'].includes(userRole) || resourceUserId === currentUserId.toString()) {
        next();
    } else {
        return res.status(403).json({ 
            message: "Access denied. You can only access your own resources.",
            code: "OWNERSHIP_REQUIRED"
        });
    }
};

module.exports = { 
    verifyToken, 
    authenticateToken, 
    checkRole, 
    checkOwnershipOrAdmin 
};

