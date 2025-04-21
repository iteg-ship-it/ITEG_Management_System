const mongoose = require("mongoose");

const StudentAdmissionProcessSchema = new mongoose.Schema(
  {
    // Central datafirstName: { type: String, required: true },
    prkey: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String, required: true },
    email: { type: String },
    studentMobile: { type: String, required: true },
    parentMobile: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true },
    aadharCard: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    stream: { type: String, required: true },
    course: { type: String, required: true },
    category: { type: String, required: true },
    subject12: { type: String, required: true },
    year12: { type: String, required: true },
    percent12: { type: String }, // not required
    itegInterviewFlag: { type: Boolean, default: false },
    admissionStatus: { type: Boolean, default: false }, // true if admitted, false if not
    admissionDate: { type: Date },

    // App-side tracking
    onlineTest: {
      date: Date,
      testLink: String,
      result: {
        type: String,
        enum: ["Pass", "Fail", "Pending"],
        default: "Pending",
      },
    },

    // Next stage interview (can be array of attempts)
    interviews: [
      {
        noOfAttempts: { type: Number, default: 0 },
        marks: { type: Number, default: 0 },
        remark: { type: String },
        date: { type: Date },
        result: {
          type: String,
          enum: ["Pass", "Fail", "Pending"],
          default: "Pending",
        },
      },
    ],

     // Date of admission
    // For account dept
    // For account dept
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentAdmissionProcess",
  StudentAdmissionProcessSchema
);
