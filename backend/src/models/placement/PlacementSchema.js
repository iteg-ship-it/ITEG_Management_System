const mongoose = require("mongoose");


const placedInfoSchema = new mongoose.Schema({
  companyRef: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  interviewRecordId: { type: mongoose.Schema.Types.ObjectId },
  companyName: { type: String, required: true },
  salary: { type: Number, required: true },
  location: { type: String, required: true },
  jobProfile: { type: String, required: true },
  jobType: { type: String, enum: ['Internship', 'Full-Time', 'PPO'], default: 'Full-Time' },
  joiningDate: { type: Date },
  placedDate: { type: Date, default: Date.now },
  offerLetterURL: { type: String },
  applicationURL: { type: String }
});


const interviewRoundSchema = new mongoose.Schema({
  roundName: { type: String, required: true },
  date: { type: Date, required: true },
  mode: { type: String, enum: ['Online', 'Offline', 'Telephonic'], default: 'Offline' },
  feedback: { type: String, default: "" },
  result: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' }
});


const interviewRecordSchema = new mongoose.Schema({
  companyRef: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
  jobProfile: { type: String, required: true },
  status: {
    type: String,
    enum: ['Scheduled', 'Rescheduled', 'Ongoing', 'Selected', 'RejectedByStudent', 'RejectedByCompany'],
    default: 'Scheduled'
  },
  statusRemark: { type: String, default: "" },
  scheduleDate: { type: Date, required: true },
  rescheduleDate: { type: Date },
  rounds: { type: [interviewRoundSchema], default: [] }
});


module.exports = { placedInfoSchema, interviewRoundSchema, interviewRecordSchema };