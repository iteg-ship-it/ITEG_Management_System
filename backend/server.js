require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const setupSwagger = require("./src/swagger/swagger");
const { securityHeaders, createRateLimit, validateInput } = require('./src/middlewares/securityMiddleware');

const app = express();

// Security headers
app.use(securityHeaders);

// Rate limiting
app.use('/api/', createRateLimit(15 * 60 * 1000, 20)); // 20 requests per 15 minutes
app.use('/api/user/login', createRateLimit(15 * 60 * 1000, 5)); // 5 login attempts per 15 minutes
app.use('/api/user/signup', createRateLimit(60 * 60 * 1000, 3)); // 3 signups per hour

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL] 
    : true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.options("*", cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Input validation middleware
app.use(validateInput);

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

// Start Server only if this is the main module (not when testing)
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      console.log("✅ Connected to MongoDB");
      // Update existing Google users role
      await updateGoogleUsersRole();
    })
    .catch((err) => console.error("❌ DB Connection Error:", err));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

