const mongoose = require("mongoose");

const StudentAdmissionProcessSchema = new mongoose.Schema(
  {
    // Basic info (from central)
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
    percent12: { type: String },

    // Admission process tracking
    itegInterviewFlag: { type: Boolean, default: false }, // Final flag
    admissionStatus: { type: Boolean, default: false }, // Admitted or not
    admissionDate: { type: Date },

    // Stage Tracker (to show current position in the process)
    interviewStage: {
      type: String,
      enum: [
        'Registered',
        'Test Scheduled',
        'Test not Attempted',
        'Test Completed',
        'First Interview Scheduled',
        'First Interview Passed',
        'Second Interview Scheduled',
        'Second Interview Passed',
        'ITEG Interview Completed'
      ],
      default: 'Registered'
    },

    // Online Test Info
    onlineTest: {
      date: Date,
      testLink: String,
      result: {
        type: String,
        enum: ['Pass', 'Fail', 'Pending', 'Not Attempted'],
        default: 'Pending'
      }
    },

    // Interview Attempts Tracking
    interviews: [
      {
        round: { type: String, enum: ['First', 'Second'], required: true, default: 'First' },
        attemptNo: { type: Number },
        marks: { type: Number },
        remark: { type: String },
        date: { type: Date },
        result: {
          type: String,
          enum: ['Pass', 'Fail', 'Pending'],
          default: 'Pending'
        }
      }
    ],

    // Optional: Current scheduled interview info
    scheduledInterview: {
      date: Date,
      round: { type: String, enum: ['First', 'Second'] },
      isScheduled: { type: Boolean, default: false }
    },

    // Optional: Who created this entry (Admin/Faculty)
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User'
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentAdmissionProcess', StudentAdmissionProcessSchema);
