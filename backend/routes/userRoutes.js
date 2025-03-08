const express = require("express");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware"); 

const router = express.Router();

router.get("/profile", verifyToken, checkRole(["User"]), (req, res) => {
    res.status(200).json({ message: "Welcome User!", user: req.user });
});


module.exports = router;
