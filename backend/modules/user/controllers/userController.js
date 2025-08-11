// require("dotenv").config();
// const User = require("../models/user");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const crypto = require("crypto");
// // const Otp = require("../models/otpModel");
// const { sendResetLinkEmail } = require("../helpers/sendOtp");
// // const generateOtp = require("../helpers/generateOtp");
// const cloudinary = require("cloudinary").v2;

// require("dotenv").config();

// const mongoose = require("mongoose");

// const generateToken = (user) => {
//   return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });
// };

// const generateRefreshToken = (user) => {
//   return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });
// };

// cloudinary.config({
//   cloud_name: 'djarooa0l',
//   api_key: '787195123151781',
//   api_secret: 'Z_iYcURHkeacMgHZS2AjxE0tON8',
// });

// exports.createUser = async (req, res) => {
//   try {
//     let {
//       profileImage,
//       name,
//       email,
//       mobileNo,
//       password,
//       adharCard,
//       department,
//       position,
//       role,
//       isActive,
//       updatedAt,
//       createdAt,
//     } = req.body;

//     if (
//       !name ||
//       !email ||
//       !mobileNo ||
//       !password ||
//       !adharCard ||
//       !department ||
//       !position ||
//       !role
//     ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // ✅ Check email is from @ssism.org
//     const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@ssism\.org$/;
//     if (!collegeEmailRegex.test(email)) {
//       return res.status(400).json({
//         message:
//           "Only institutional emails (@ssism.org) are allowed to register.",
//       });
//     }

//     // Convert email to lowercase
//     email = email.toLowerCase();

//     // Allowed roles
//     const allowedRoles = ["admin", "superadmin", "faculty"];
//     if (!allowedRoles.includes(role)) {
//       return res.status(400).json({
//         message:
//           "Invalid role. Only admin, superadmin, and faculty are allowed.",
//       });
//     }

//     // Check if user already exists by email or Aadhar
//     const existingUser = await User.findOne({
//       $or: [{ email }, { adharCard }],
//     });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ message: "User with this email or Aadhar already exists." });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Upload Profile Image to Cloudinary
//     // let base64Image = imageBase64.startsWith("data:image")
//     //   ? imageBase64
//     //   : `data:image/png;base64,${imageBase64}`;

//     // const result = await cloudinary.uploader.upload(base64Image, { folder: "uploads" });
//     // console.log(userRecord.uid,"userRecord.uid")

//     // Create new user
//     const newUser = new User({
//       profileImage,
//       name,
//       email,
//       mobileNo,
//       password: hashedPassword,
//       adharCard,
//       department,
//       position,
//       role,
//       isActive,
//       updatedAt,
//       createdAt,
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: `${
//         role.charAt(0).toUpperCase() + role.slice(1)
//       } created successfully!`,
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         email: newUser.email,
//         mobileNo: newUser.mobileNo,
//         role: newUser.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // ✅ Check email is from @ssism.org
//     const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@ssism\.org$/;
//     if (!collegeEmailRegex.test(email)) {
//       return res.status(403).json({
//         message: "Only institutional emails (@ssism.org) are allowed to login.",
//       });
//     }

//     // 🔥 Validate input early
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email and password are required" });
//     }

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(401).json({ message: "Invalid email or password" });

//     // Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid email or password" });

//     // Generate JWT
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     const refreshToken = generateRefreshToken(user);
//     user.refreshToken = refreshToken;
//     await user.save();

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       refreshToken,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         position: user.position,
//         department: user.department,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// exports.refreshAccessToken = async (req, res) => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       return res.status(401).json({ message: "Refresh token required" });
//     }

//     // Find user by refresh token
//     const user = await User.findOne({ refreshToken });
//     if (!user)
//       return res.status(403).json({ message: "Invalid refresh token" });

//     // Verify token
//     jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
//       if (err)
//         return res
//           .status(403)
//           .json({ message: "Invalid or expired refresh token" });

//       const newAccessToken = jwt.sign(
//         { id: decoded.id, role: user.role },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       res.status(200).json({
//         message: "Access token refreshed",
//         accessToken: newAccessToken,
//       });
//     });
//   } catch (err) {
//     console.error("Refresh token error:", err.message);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// exports.getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const formattedUser = {
//       ...user._doc,
//       id: user._id,       // add id
//     };
//     delete formattedUser._id;
//     delete formattedUser.__v;

//     res.status(200).json({ success: true, user: formattedUser });
//   } catch (err) {
//     console.error("Error fetching user:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// exports.logout = async (req, res) => {
//   try {
//     const userId = req.body.id || req.body._id;

//     console.log("📩 Logout request received for userId:", userId); // Log the incoming ID

//     if (!userId) {
//       return res.status(400).json({ message: "User ID is required" });
//     }

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     user.refreshToken = null; // Assuming refreshToken stored in DB
//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Logged out successfully" });
//   } catch (error) {
//     console.error("Logout error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.updateUserFields = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     // Extract only allowed fields
//     const { name, position, role, department, isActive } = req.body;

//     const updatedData = {
//       ...(name && { name }),
//       ...(position && { position }),
//       ...(role && { role }),
//       ...(department && { department }),
//       ...(typeof isActive === "boolean" && { isActive }),
//       updatedAt: new Date(), // Always update the updatedAt field
//     };

//     const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedUser) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ success: false, message: "Server error", error });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     //1. Generate token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "15m",
//     });

//     //2. Save token + expiry + used = false
//     user.resetPasswordToken = token;
//     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
//     user.resetTokenUsed = false;
//     await user.save();

//     const resetLink = `${token}`;
//     await sendResetLinkEmail(email, resetLink);

//     res.status(200).json({ message: "Reset link sent to your email." });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { newPassword, confirmPassword } = req.body;

//   if (!newPassword || !confirmPassword)
//     return res.status(400).json({ message: "Both fields are required" });

//   if (newPassword !== confirmPassword)
//     return res.status(400).json({ message: "Passwords do not match" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);

//     if (!user || user.resetPasswordToken !== token || user.resetTokenUsed)
//       return res.status(400).json({ message: "Invalid or expired token" });

//     if (user.resetPasswordExpires < Date.now())
//       return res.status(400).json({ message: "Token has expired" });

//     // Password hashing (either pre-save or manual)
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;

//     // Invalidate the token after first use
//     user.resetTokenUsed = true;
//     await user.save();

//     res.status(200).json({ message: "Password successfully reset" });
//   } catch (err) {
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

// exports.googleAuthCallback = async (req, res) => {
//   try {
//     const { _json } = req.user;
//     const { sub, email, name } = _json;

//     if (!email.endsWith("@ssism.org")) {
//       return res.status(403).json({
//         message: "Only institutional emails (@ssism.org) are allowed to login.",
//       });
//     }

//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         googleId: sub,
//         email,
//         name,
//         role: "admin", // Default role, can be changed later
//         profileImage: _json.picture || "https://via.placeholder.com/150", // Default image if not provided
//       });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     user.refreshToken = refreshToken;
//     await user.save();

//     //  const redirectUrl = `${process.env.GOOGLE_REDIRECT_URI}?token=${token}&refreshToken=${refreshToken}&userId=${user._id}`;
//     // const redirectUrl = `${process.env.GOOGLE_REDIRECT_URI}?token=${token}&refreshToken=${refreshToken}&userId=${user._id}&name=${encodeURIComponent(user.name)}&role=${user.role || ''}&email=${user.email}`;
//     const redirectUrl = `${process.env.GOOGLE_REDIRECT_URI}?token=${token}&refreshToken=${refreshToken}&userId=${user._id}&name=${encodeURIComponent(user.name)}&role=${user.role}&email=${user.email}`;


//     return res.redirect(redirectUrl);
//   } catch (error) {
//     console.error("Google login failed:", error);
//     res.status(500).json({ error: "Login failed" });
//   }
// };


// exports.getCurrentUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const formattedUser = {
//       ...user._doc,
//       id: user._id,
//     };
//     delete formattedUser._id;
//     delete formattedUser.__v;

//     res.status(200).json({ success: true, user: formattedUser });
//   } catch (error) {
//     console.error("Error fetching current user:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// ✨ JWT, bcrypt, and other setups
require("dotenv").config();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetLinkEmail } = require("../helpers/sendOtp");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// 🌩️ Cloudinary Config
cloudinary.config({
  cloud_name: 'djarooa0l',
  api_key: '787195123151781',
  api_secret: 'Z_iYcURHkeacMgHZS2AjxE0tON8',
});

// ✅ CREATE USER
exports.createUser = async (req, res) => {
  try {
    let {
      profileImage,
      name,
      email,
      mobileNo,
      password,
      adharCard,
      department,
      position,
      role,
      isActive,
      updatedAt,
      createdAt,
    } = req.body;

    if (!name || !email || !mobileNo || !password || !adharCard || !department || !position || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@ssism\.org$/;
    if (!collegeEmailRegex.test(email)) {
      return res.status(400).json({
        message: "Only institutional emails (@ssism.org) are allowed to register.",
      });
    }

    email = email.toLowerCase();

    const allowedRoles = ["admin", "superadmin", "faculty"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Only admin, superadmin, and faculty are allowed.",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { adharCard }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or Aadhar already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      profileImage,
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
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNo: newUser.mobileNo,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// Helper functions
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const collegeEmailRegex = /^[a-zA-Z0-9._%+-]+@ssism\.org$/;
    if (!collegeEmailRegex.test(email)) {
      return res.status(403).json({
        message: "Only institutional emails (@ssism.org) are allowed to login.",
      });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ✅ REFRESH ACCESS TOKEN
exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired refresh token" });

      const newAccessToken = jwt.sign(
        { id: decoded.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      res.status(200).json({
        message: "Access token refreshed",
        accessToken: newAccessToken,
      });
    });
  } catch (err) {
    console.error("Refresh token error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔐 LOGOUT
exports.logout = async (req, res) => {
  try {
    const userId = req.body.id || req.body._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 👤 GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const formattedUser = {
      ...user._doc,
      id: user._id,
    };
    delete formattedUser._id;
    delete formattedUser.__v;

    res.status(200).json({ success: true, user: formattedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✏️ UPDATE USER FIELDS
exports.updateUserFields = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, position, role, department, isActive } = req.body;

    const updatedData = {
      ...(name && { name }),
      ...(position && { position }),
      ...(role && { role }),
      ...(department && { department }),
      ...(typeof isActive === "boolean" && { isActive }),
      updatedAt: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// 🔐 FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

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

// 🔁 RESET PASSWORD
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetTokenUsed = true;

    await user.save();

    res.status(200).json({ message: "Password successfully reset" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

// 🔒 GOOGLE AUTH CALLBACK
exports.googleAuthCallback = async (req, res) => {
  try {
    const { _json } = req.user;
    const { sub, email, name } = _json;

    if (!email.endsWith("@ssism.org")) {
      return res.status(403).json({
        message: "Only institutional emails (@ssism.org) are allowed to login.",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId: sub,
        email,
        name,
        role: "superadmin",
        profileImage: _json.picture || "https://via.placeholder.com/150",
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    user.refreshToken = refreshToken;
    await user.save();

    const redirectUrl = `${process.env.GOOGLE_REDIRECT_URI}?token=${token}&refreshToken=${refreshToken}&userId=${user._id}&name=${encodeURIComponent(user.name)}&role=${user.role}&email=${user.email}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google login failed:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// 🧠 GET CURRENT USER
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formattedUser = {
      ...user._doc,
      id: user._id,
    };
    delete formattedUser._id;
    delete formattedUser.__v;

    res.status(200).json({ success: true, user: formattedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
