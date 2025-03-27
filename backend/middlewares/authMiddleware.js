const jwt = require("jsonwebtoken");

// Middleware to verify JWT and check roles
const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access Denied. No token provided." });
    }

<<<<<<< HEAD
    const token = authHeader.split(" ")[1];

=======
    const token = authHeader.split(" ")[1]; // ✅ Now it's safe to split
console.log("Received Token:", token); 
>>>>>>> backend_main
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user details to request object

        console.log("Decoded JWT:", decoded); // Debugging line

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
};


// Middleware to check required role
const checkRole = (roles) => {
    return (req, res, next) => {
<<<<<<< HEAD
        console.log("User Role from JWT:", req.user.role);
        console.log("Allowed Roles:", roles);

=======
        console.log("User Role:", req.user.role); 
>>>>>>> backend_main
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access Denied. Unauthorized Role." });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };

