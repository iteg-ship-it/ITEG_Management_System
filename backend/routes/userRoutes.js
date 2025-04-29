const express = require("express");
const usercontroller = require("../modules/user/controllers/userController");
const router = express.Router();

// POST /api/users/create
router.post("/signup",usercontroller. createUser);
router.post("/login",usercontroller.login);
router.post("/logout", usercontroller.logout);

router.post("/refresh_token", usercontroller.refreshAccessToken);

module.exports = router;
