const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true },
  companyLogo: { type: String, required: true }, // Base64 image
  headOffice: { type: String, required: true },
  industry: { type: String },
  website: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);