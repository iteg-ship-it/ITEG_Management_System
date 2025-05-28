const express = require("express");
const usercontroller = require("../modules/user/controllers/userController");
const passport = require("passport");
const { googleAuthCallback } = require('../modules/user/controllers/userController');
const { verifyToken } = require("../middlewares/authMiddleware");

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


router.get("/get/:id", usercontroller.getUserById);



// router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get("/google", passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })
  );
  
router.get("/google/callback", passport.authenticate('google', { session: false }), googleAuthCallback);

router.get("/me", verifyToken, usercontroller.getCurrentUser);

module.exports = router;

