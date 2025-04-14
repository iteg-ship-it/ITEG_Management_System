require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const setupSwagger = require('./swagger/swagger');

const protectedRoutes = require("./routes/protectedRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const student_admissionProcessRoutes = require("./routes/studentAdmissionProcessRoutes.js");
const AdminRoutes = require("./routes/adminRoutes.js");
const superAdminRoutes = require("./routes/superAdminRoutes.js");
const facultyRoutes= require("./routes/facultyRoutes.js");

const webhookRoutes = require("./routes/webhookRoutes");



const app = express();

setupSwagger(app); 
// Middleware

app.use(
  cors({
    origin: "http://localhost:5173", // or '*' to allow all
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // only if you're using cookies or sessions
  })
);

app.options("*", cors());
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/admin", AdminRoutes);
app.use("/api/superAdmin", superAdminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/studentAdmissionProcess", student_admissionProcessRoutes);

app.use("/api/webhook", webhookRoutes);

// app.use("/api/", studentAdmission);
app.use("/api/studentAdmission",student_admissionProcessRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("JWT Authentication API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






