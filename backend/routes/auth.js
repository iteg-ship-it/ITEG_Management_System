const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const Admin = require("../modules/Admin");
const Admin = require("../modules/Admin/models/Adminmodels");
const faculty = require("../modules/Faculty/models/facultymodels");


const router = express.Router();

// User Registration Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Default role Faculty agar koi role specify nahi kare
        const userRole = role || "Faculty";

        // Check if user already exists
        let Admin = await Admin.findOne({ email });
        if (Admin) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user to database
        Admin = new Admin({ name, email, password: hashedPassword, role: userRole });
        await user.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

module.exports = router;




// User Login Route
router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "Invalid Credentials" });
      }

      // Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid Credentials" });
      }

      // Generate JWT Token with user role
      const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
      );
      

      res.status(200).json({ token });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
});
