require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const setupSwagger = require('./swagger/swagger');

const protectedRoutes = require("./routes/protectedRoutes");
const studentRoutes = require("./routes/studentRoutes");
const student_admissionProcessRoutes = require("./routes/student_admissionProcessRoutes.js");

const auth = require("./routes/auth");
const AdminRoutes = require("./routes/AdminRoutes");
const superAdminRoutes = require("./routes/SuperAdminRoutes");
const facultyRoutes= require("./routes/facultyRoutes");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');


const app = express();

setupSwagger(app); 
// Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/auth", auth);
app.use("/api/admin", AdminRoutes);
app.use("/api/superAdmin", superAdminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/students", studentRoutes);



// app.use("/api/", studentAdmission);
app.use("/api/studentAdmission",student_admissionProcessRoutes);

// expressOasGenerator.init(app, {});

// const swaggerFilePath = './openapi.json';
// if (fs.existsSync(swaggerFilePath)) {
//   const swaggerDocument = require(swaggerFilePath);
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// }
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






