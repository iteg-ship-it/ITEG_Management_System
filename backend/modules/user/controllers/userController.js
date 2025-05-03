const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Otp = require("../models/otpModel");
const { sendResetLinkEmail } = require("../helpers/sendOtp");
const generateOtp = require("../helpers/generateOtp");

require("dotenv").config();

const mongoose = require('mongoose');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};



exports.createUser = async (req, res) => {
  try {
    let { name, email, mobileNo, password, adharCard, department, position, role, isActive, updatedAt, createdAt } = req.body;

    if (!name || !email || !mobileNo || !password || !adharCard || !department || !position || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

        // ✅ Check email is from @ssism.org
        const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@ssism\.org$/;
        if (!collegeEmailRegex.test(email)) {
          return res.status(400).json({
            message: "Only institutional emails (@ssism.org) are allowed to register."
          });
        }
    

    // Convert email to lowercase
    email = email.toLowerCase();

    // Allowed roles
    const allowedRoles = ["admin", "superadmin", "faculty"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message:
          "Invalid role. Only admin, superadmin, and faculty are allowed.",
      });
    }

    // Check if user already exists by email or Aadhar
    const existingUser = await User.findOne({ $or: [{ email }, { adharCard }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or Aadhar already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      mobileNo,
      password: hashedPassword,
      adharCard,
      department,
      position,
      role,
      isActive,
      updatedAt,
      createdAt,
    });

    await newUser.save();

    res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNo: newUser.mobileNo,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;


          // ✅ Check email is from @ssism.org
    const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@ssism\.org$/;
    if (!collegeEmailRegex.test(email)) {
      return res.status(403).json({
        message: "Only institutional emails (@ssism.org) are allowed to login."
      });
    }



         // 🔥 Validate input early
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });
  
      // Generate JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const refreshToken = generateRefreshToken(user);
      user.refreshToken = refreshToken;
      await user.save();
  
      res.status(200).json({
        message: "Login successful",
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position,
          department: user.department,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  

  exports.refreshAccessToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;
  
      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }
  
      // Find user by refresh token
      const user = await User.findOne({ refreshToken });
      if (!user) return res.status(403).json({ message: "Invalid refresh token" });
  
      // Verify token
      jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });
  
        const newAccessToken = jwt.sign(
          { id: decoded.id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
  
        res.status(200).json({
          message: "Access token refreshed",
          accessToken: newAccessToken
        });
      });
    } catch (err) {
      console.error("Refresh token error:", err.message);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  


  exports.logout = async (req, res) => {
    try {
      const { _id } = req.body;
  
      if (!_id) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      const user = await User.findById(_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.refreshToken = null;
      await user.save();
  
      res.status(200).json({ message: "Logged out successfully, refresh token removed" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  exports.updateUserFields = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Extract only allowed fields
      const { name,position, role,department, isActive } = req.body;
   
      const updatedData = {
        ...(name && { name }),
        ...(position && { position }),
        ...(role && { role }),
        ...(department && { department }),
        ...(typeof isActive === 'boolean' && { isActive }),
        updatedAt: new Date(), // Always update the updatedAt field
      };
  
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser
      });
  
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ success: false, message: "Server error", error });
    }
  };
  
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    //1. Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    //2. Save token + expiry + used = false
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    user.resetTokenUsed = false;
    await user.save();

    const resetLink = `${token}`;
    await sendResetLinkEmail(email, resetLink);

    res.status(200).json({ message: "Reset link sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword)
    return res.status(400).json({ message: "Both fields are required" });

  if (newPassword !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.resetPasswordToken !== token || user.resetTokenUsed)
      return res.status(400).json({ message: "Invalid or expired token" });

    if (user.resetPasswordExpires < Date.now())
      return res.status(400).json({ message: "Token has expired" });

    // Password hashing (either pre-save or manual)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Invalidate the token after first use
    user.resetTokenUsed = true;
    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
