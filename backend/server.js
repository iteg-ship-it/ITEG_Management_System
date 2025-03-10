// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const superAdminRoutes = require('./routes/superAdminRoutes');

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// app.use('/api/superadmin', superAdminRoutes);

// const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// app.use('/api/superadmin', superAdminRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { connectMongoDB } = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const studentRoutes = require("./routes/studentRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const levelRoutes = require("./routes/levelRoutes");
const auth = require("./routes/auth");
const AdminRoutes = require("./routes/AdminRoutes");
const superAdminRoutes = require("./routes/SuperAdminRoutes");
const facultyRoutes= require("./routes/facultyRoutes");
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
connectMongoDB();

app.use("/api/auth", auth);
app.use("/api/admin", AdminRoutes);
app.use("/api/superAdmin", superAdminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
// app.use("/api/students", studentRoutes);
//Routes
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/interview", interviewRoutes);
app.use("/api/level", levelRoutes);
app.use("/api/user", userRoutes);


// MongoDB Connection
mongoose
  // .connect(process.env.MONGO_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true
  // })
  // .then(() => console.log("Connected to MongoDB"))
  // .catch((err) => console.log("DB Connection Error: ", err));/
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.get("/", (req, res) => {
  res.send("JWT Authentication API Running...");
});


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));


app.use(express.json()); // JSON Parsing
app.use("/api/users", userRoutes); // Use Routes
app.use("/api/students", studentRoutes); // Use Routes
app.use("/api/interviews", interviewRoutes); // Use Routes

