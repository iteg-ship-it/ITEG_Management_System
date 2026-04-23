const User = require("../../models/user/user");
const {
  getPromotionPreview,
  promoteStudent,
  getPromotionHistory
} = require("../../services/studentPromotionService");

exports.getPromotionPreview = async (req, res) => {
  try {
    const data = await getPromotionPreview(req.params.studentId);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

exports.promoteStudent = async (req, res) => {
  try {
    const promotedBy = await User.findById(req.user.id || req.user._id).select("name role");

    if (!promotedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found"
      });
    }

    const result = await promoteStudent(
      req.params.studentId,
      promotedBy,
      req.body.remark
    );

    res.status(200).json({
      success: true,
      message: "Student promoted successfully",
      data: result
    });
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPromotionHistory = async (req, res) => {
  try {
    const history = await getPromotionHistory(req.params.studentId);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    const statusCode = error.message === "Student not found" ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};
