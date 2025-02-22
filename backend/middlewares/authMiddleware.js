const jwt = require("jsonwebtoken");

// Middleware to verify JWT and check roles
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(403).json({ message: "Access Denied. No token provided." });
    }
    const authHeader= authHeader.split(" ")[1]; // Assumes "Bearer <token>"

    if (!authHeader) {
        return res.status(403).json({ message: "Access Denied. No token provided." });
    }


    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Attach user details (userId, role) to request object
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};


// Middleware to check required role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.body || !roles.includes(req.body.role)) {
            return res.status(403).json({ message: "Access Denied. Unauthorized Role." });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
