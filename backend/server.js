// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');

// const superAdminRoutes = require('./routes/superAdminRoutes');

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
<<<<<<< HEAD

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
=======

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error(err));

// app.use('/api/superadmin', superAdminRoutes);

// const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



>>>>>>> b4f91c9ed6f75122bc1a8a384bea70a5877ed9a9
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/AdminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentAdmissionRoutes = require('./routes/student_admissionProcessRoutes');
const protectedRoutes = require("./routes/protectedRoutes");
const studentRoutes = require("./routes/studentRoutes");
const { connectMongoDB } = require("./config/db");



const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

<<<<<<< HEAD
connectMongoDB();

=======
// Routes
>>>>>>> b4f91c9ed6f75122bc1a8a384bea70a5877ed9a9
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
<<<<<<< HEAD
app.use("/api/students", studentRoutes);
//Routes
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .catch((err) => console.log("MongoDB Connection Error:", err));
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
=======
app.use('/api/students', studentAdmissionRoutes);

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
>>>>>>> b4f91c9ed6f75122bc1a8a384bea70a5877ed9a9
