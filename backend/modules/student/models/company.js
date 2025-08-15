const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true },
  companyLogo: { type: String}, 
  hrEmail:{type:String},
  // headOffice: { type: String, required: true },
  location:{type:String},
  // industry: { type: String },
  // website: { type: String },
  // description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);

// hr email, location, 