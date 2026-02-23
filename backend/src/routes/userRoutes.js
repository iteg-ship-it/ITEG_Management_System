const express = require("express");
const usercontroller = require("../controllers/user/userController");
const passport = require("passport");
const { googleAuthCallback } = require('../controllers/user/userController');
const { verifyToken, checkRole, checkOwnershipOrAdmin } = require("../middlewares/authMiddleware");
const { createRateLimit } = require('../middlewares/securityMiddleware');

const router = express.Router();

// Rate limits for sensitive operations
const strictRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
const authRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 requests per 15 minutes

// Authentication routes
router.post("/login", strictRateLimit, usercontroller.login);
router.post("/logout", authRateLimit, usercontroller.logout);
router.post("/refresh_token", authRateLimit, usercontroller.refreshAccessToken);

// Password reset routes
router.post("/forgot_password", strictRateLimit, usercontroller.forgotPassword);
router.post("/reset_password/:token", strictRateLimit, usercontroller.resetPassword);

// Google OAuth
router.get("/google", passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })
  );
router.get("/google/callback", passport.authenticate('google', { session: false }), googleAuthCallback);

// Protected routes - require authentication
router.use(verifyToken); // All routes below require authentication

// User management routes
router.post("/signup", checkRole(['admin', 'superadmin']), usercontroller.createUser);
router.get("/me", usercontroller.getCurrentUser);
router.get("/get/:id", checkOwnershipOrAdmin, usercontroller.getUserById);
router.patch('/update/:id', checkOwnershipOrAdmin, usercontroller.updateUserFields);

// Admin only routes
router.get("/all", checkRole(['admin', 'superadmin']), usercontroller.getAllUsers);
router.delete("/delete/:id", checkRole(['superadmin']), usercontroller.deleteUser);

module.exports = router;

