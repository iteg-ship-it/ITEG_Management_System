const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../../models/student/Student");
const cloudinary = require("../../config/cloudinaryConfig");

// ✅ Student Login (PR Key + Password)
exports.studentLogin = async (req, res) => {
  try {
    const { prkey, password } = req.body;
    if (!prkey || !password)
      return res.status(400).json({ message: "prkey and password are required" });

    const student = await Student.findOne({ prkey })
      .populate("subDepartmentId", "name")
      .populate("sessionId", "name")
      .populate("currentLevelId", "name order")
      .populate("currentSubLevelId", "name order");

    if (!student)
      return res.status(404).json({ message: "Student not found" });

    if (student.status === "Dropped")
      return res.status(403).json({ message: "Your account has been deactivated. Contact admin." });

    if (!student.password)
      return res.status(403).json({ message: "Password not set. Contact admin to set your password." });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: student._id, prkey: student.prkey, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      refreshToken,
      student: {
        _id: student._id,
        prkey: student.prkey,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentMobile: student.studentMobile,
        image: student.image,
        course: student.course,
        status: student.status,
        isFTP: student.isFTP,
        subDepartmentId: student.subDepartmentId,
        sessionId: student.sessionId,
        currentLevelId: student.currentLevelId,
        currentSubLevelId: student.currentSubLevelId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Set / Reset Student Password (Admin only)
exports.setStudentPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const hashed = await bcrypt.hash(password, 10);
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { password: hashed },
      { new: true }
    ).select("_id prkey firstName lastName");

    if (!student) return res.status(404).json({ message: "Student not found" });

    return res.status(200).json({ message: "Password set successfully", data: student });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get My Profile (Student)
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("subDepartmentId", "name")
      .populate("sessionId", "name")
      .populate("syllabusVersionId", "version title")
      .populate("currentLevelId", "name order")
      .populate("currentSubLevelId", "name order")
      .select("-password");

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Attach placement data
    const StudentPlacement = require("../../models/placement/StudentPlacement");
    const placement = await StudentPlacement.findOne({ studentId: req.user.id })
      .select("readinessStatus placedInfo PlacementinterviewRecord resumeURL");

    return res.status(200).json({
      data: {
        ...student.toObject(),
        placement: placement || null,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update My Profile Image (Student)
exports.updateMyProfileImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "Image is required" });
    if (!/^data:image\/(png|jpeg|jpg|gif);base64,/.test(image))
      return res.status(400).json({ message: "Invalid image format" });

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "student_profiles",
      public_id: `student_${req.user.id}`,
      overwrite: true,
    });

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      { image: uploadResponse.secure_url },
      { new: true }
    ).select("_id image");

    return res.status(200).json({ message: "Profile image updated", imageURL: student.image });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Change My Password (Student)
exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const student = await Student.findById(req.user.id).select("password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
