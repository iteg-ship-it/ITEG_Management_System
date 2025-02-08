require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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


