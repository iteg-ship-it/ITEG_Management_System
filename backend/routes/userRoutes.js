const express = require("express");
const usercontroller = require("../modules/user/controllers/userController");
const router = express.Router();

// POST /api/users/create
router.post("/create",usercontroller. createUser);

router.post("/login",usercontroller.login);
router.post("/refresh-token", usercontroller.refreshAccessToken);
router.post("/logout", usercontroller.logout);


router.post("/login-with-otp", usercontroller.loginWithOtpRequest);
router.post("/verify-otp", usercontroller.verifyOtpAndLogin);


module.exports = router;
