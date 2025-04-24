const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otpModel");
const sendOtp = require("../helpers/sendOtp");
const generateOtp = require("../helpers/generateOtp");

const bcrypt = require("bcrypt");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, adharCard, department, positionRole, role } = req.body;

    // Allowed roles
    const allowedRoles = ["admin", "superadmin", "faculty"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Only admin, superadmin, and faculty are allowed." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { adharCard }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or Aadhar already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      adharCard,
      department,
      positionRole,
      role
    });

    await newUser.save();

    // Generate JWT Token
    const token = generateToken(newUser);

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};


exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
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
  
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          positionRole: user.positionRole,
          department: user.department,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  

  exports.loginWithOtpRequest = async (req, res) => {
    try {
      const { mobileNo } = req.body;
  
      // 1. Check user exists
      const user = await User.findOne({ mobileNo });
      if (!user) return res.status(404).json({ message: "User not found with this mobile number" });
  
      // 2. Generate OTP
      const otp = generateOtp();
  
      // 3. Save OTP in DB
      await Otp.create({ email: user.email, otp });
  
      // 4. Send OTP to user's mobile number
      await sendOtp(mobileNo, otp);
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
      console.error("OTP request error:", err.message);
      res.status(500).json({ message: "Failed to send OTP", error: err.message });
    }
  };


  exports.verifyOtpAndLogin = async (req, res) => {
    try {
      const { mobileNo, otp } = req.body;
  
      // 1. Find user
      const user = await User.findOne({ mobileNo });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // 2. Get latest OTP from DB
      const latestOtp = await Otp.findOne({ email: user.email }).sort({ createdAt: -1 });
  
      if (!latestOtp || latestOtp.otp !== otp) {
        return res.status(401).json({ message: "Invalid or expired OTP" });
      }
  
      // 3. Delete OTP after successful verification
      await Otp.deleteMany({ email: user.email });
  
      // 4. Generate JWT
      const token = generateToken(user);
  
      res.status(200).json({
        message: "OTP verified successfully. Login success.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          positionRole: user.positionRole,
        },
      });
    } catch (err) {
      console.error("OTP verify error:", err.message);
      res.status(500).json({ message: "OTP verification failed", error: err.message });
    }
  };
  