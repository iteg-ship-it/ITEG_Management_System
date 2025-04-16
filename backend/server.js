const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
<<<<<<< HEAD
const setupSwagger = require('./swagger/swagger');

const protectedRoutes = require("./routes/protectedRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const student_admissionProcessRoutes = require("./routes/studentAdmissionProcessRoutes.js");
const AdminRoutes = require("./routes/adminRoutes.js");
const superAdminRoutes = require("./routes/superAdminRoutes.js");
const facultyRoutes= require("./routes/facultyRoutes.js");

const webhookRoutes = require("./routes/webhookRoutes");


=======
require("dotenv").config();
>>>>>>> 03424861b9c815f0f76ebc1db131eb33f581a8c0

// Import Routes
const adminRoutes = require("./routes/AdminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentAdmissionRoutes = require("./routes/studentAdmissionProcessRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const superAdminRoutes = require("./routes/SuperAdminRoutes");
const admittedStudentRoutes = require("./routes/studentRoutes");
//expres object
const app = express();
// cors for frontend and backend communication
app.use(
  cors({
    origin: "http://localhost:5173", // or '*' to allow all
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // only if you're using cookies or sessions
  })
);

app.options("*", cors());
app.use(express.json());


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/students/admission", studentAdmissionRoutes);
app.use("/api/students", admittedStudentRoutes);

<<<<<<< HEAD
app.use("/api/webhook", webhookRoutes);

// app.use("/api/", studentAdmission);
app.use("/api/studentAdmission",student_admissionProcessRoutes);
=======
app.use("/api/superAdmin", superAdminRoutes);
>>>>>>> 03424861b9c815f0f76ebc1db131eb33f581a8c0

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
