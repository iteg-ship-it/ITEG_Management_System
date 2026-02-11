require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const setupSwagger = require("./src/swagger/swagger");

const app = express();

// CORS configuration
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.options("*", cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Import Routes
const routes = require("./src/routes");
const passport = require("./src/config/passport.js");

// Swagger setup
setupSwagger(app);

// Health Check Route
app.get('/api/health-check', (req, res) => {
  console.log("🔥 Health check hit!");
  res.status(200).send("Backend is alive 🚀");
});

// API Routes
app.use('/api', routes);

// Passport initialization
app.use(passport.initialize());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// MongoDB Connection
module.exports = app;
// Update Google users role function
const updateGoogleUsersRole = async () => {
  try {
    const User = require("./src/models/user/user");
    const result = await User.updateMany(
      { googleId: { $exists: true } },
      { $set: { role: "superadmin" } }
    );
    console.log(`✅ Updated ${result.modifiedCount} Google users to superadmin role`);
  } catch (error) {
    console.error("❌ Error updating Google users:", error);
  }
};

// Initialize permissions for existing users
const initializePermissions = async () => {
  try {
    const { initializePermissionsForExistingUsers } = require("./src/utils/permissionUtils");
    await initializePermissionsForExistingUsers();
  } catch (error) {
    console.error("❌ Error initializing permissions:", error);
  }
};

// Start Server only if this is the main module (not when testing)
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("✅ Connected to MongoDB");
      // Update existing Google users role
      await updateGoogleUsersRole();
      // Initialize permissions for existing users
      await initializePermissions();
    })
    .catch((err) => console.error("❌ DB Connection Error:", err));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

