const express = require("express");
const usercontroller = require("../modules/user/controllers/userController");

const router = express.Router();

// POST /api/users/create
router.post("/signup",usercontroller. createUser);
router.post("/login",usercontroller.login);
router.post("/logout", usercontroller.logout);
router.patch('/update/:id', usercontroller.updateUserFields);

router.post("/refresh_token", usercontroller.refreshAccessToken);

// Forgot Password - send email
router.post("/forgot_password", usercontroller.forgotPassword);

// Reset Password using link
router.post("/reset_password/:token", usercontroller.resetPassword);


module.exports = router;

