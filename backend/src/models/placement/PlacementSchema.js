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
  roundType: { type: String, default: "Technical" },
  date: { type: Date, required: true },
  time: { type: String, default: "" },
  mode: { type: String, enum: ['Online', 'Offline', 'Telephonic'], default: 'Offline' },
  interviewer: { type: String, default: "" },
  meetingLink: { type: String, default: "" },
  location: { type: String, default: "" },
  notes: { type: String, default: "" },
  feedback: { type: String, default: "" },
  resultReason: { type: String, default: "" },
  result: { type: String, enum: ['Passed', 'Failed', 'Pending', 'Cleared', 'Not Cleared', 'Selected', 'Rejected', 'On Hold', 'Withdrawn'], default: 'Pending' }
});


const interviewRecordSchema = new mongoose.Schema({
  companyRef: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
  jobProfile: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'Scheduled', 'Interview Scheduled',
      'Rescheduled', 'Interview Rescheduled',
      'Ongoing', 'Interview In Progress',
      'Selected', 'Not Selected',
      'Offer Received', 'Offer Declined',
      'Did Not Join', 'Placed', 'Cancelled',
      'RejectedByStudent', 'RejectedByCompany', 'OnHold'
    ],
    default: 'Scheduled'
  },
  statusRemark: { type: String, default: "" },
  cancellationReason: { type: String, default: "" },
  notJoiningReason: { type: String, default: "" },
  notJoiningRemarks: { type: String, default: "" },
  scheduleDate: { type: Date, required: true },
  rescheduleDate: { type: Date },
  rescheduleHistory: [{
    originalDate: { type: Date },
    newDate: { type: Date },
    reason: { type: String, default: "" },
    rescheduledBy: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now }
  }],
  rounds: { type: [interviewRoundSchema], default: [] }
});


module.exports = { placedInfoSchema, interviewRoundSchema, interviewRecordSchema };