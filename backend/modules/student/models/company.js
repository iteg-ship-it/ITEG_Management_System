const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true, trim: true },
  hrEmail: { type: String, required: true, trim: true },
  hrContact: { type: String,default: "not-provided@example.com"}, // Optional - sometimes only email available
  location: { type: String,  default: "Not provided"},
  headOffice: { type: String, default: "" }, // Head office location
  companyLogo: { type: String, default: "" }, // Will be added during post creation
  industry: { type: String, trim: true },
  website: { type: String, trim: true },
  description: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);

// hr email, location, 