const express = require("express");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware"); // ✅ Ensure proper import

const router = express.Router();

router.get("/profile", verifyToken, checkRole(["User"]), (req, res) => {
    res.status(200).json({ message: "Welcome User!", user: req.user });
});


module.exports = router;
