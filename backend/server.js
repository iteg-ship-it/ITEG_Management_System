const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const setupSwagger = require('./swagger/swagger');
// Import Routes
const webhookRoutes = require("./routes/webhookRoutes");

const studentAdmissionRoutes = require("./routes/studentAdmissionProcessRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const admittedStudentRoutes = require("./routes/studentRoutes");
const userRoutes=require("./routes/userRoutes.js");
//expres object
const app = express();
// cors for frontend and backend communication
setupSwagger(app);
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

app.use("/api/protected", protectedRoutes);
app.use("/api/students/admission", studentAdmissionRoutes);
app.use("/api/students", admittedStudentRoutes);


app.use("/api/webhook", webhookRoutes);

app.use("/api/user", userRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
