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
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const studentRoutes = require("./routes/studentRoutes");
const { connectMongoDB } = require("./config/db");



const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

connectMongoDB();

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
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
