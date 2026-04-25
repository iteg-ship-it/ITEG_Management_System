const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, unique: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Session", sessionSchema);
