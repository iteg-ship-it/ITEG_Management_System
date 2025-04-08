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



const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const adminRoutes = require("./routes/AdminRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentAdmissionRoutes = require('./routes/student_admissionProcessRoutes');
const protectedRoutes = require("./routes/protectedRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
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
