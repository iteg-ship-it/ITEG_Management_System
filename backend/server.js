const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();


// Import Routes
const adminRoutes = require("./routes/AdminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentAdmissionRoutes = require('./routes/student_admissionProcessRoutes');
const protectedRoutes = require("./routes/protectedRoutes");
const superAdminRoutes = require("./routes/SuperAdminRoutes")
//expres object 
const app = express();
// cors for frontend and backend communication
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
app.use('/api/students', studentAdmissionRoutes);
app.use("/api/superAdmin",superAdminRoutes)

// MongoDB Connection
mongoose
.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
