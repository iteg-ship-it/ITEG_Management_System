const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  levelNo: { type: String, default: "1A" }, // e.g., "Level 1"
  noOfAttempts: { type: Number, default: 0 },
  Topic: { type: String, default: "" },
  Theoretical_Marks: { type: Number, default: 0 },
  Practical_Marks: { type: Number, default: 0 },
  Communication_Marks: { type: Number, default: 0 },
  marks: { type: Number, default: 0 }, // total marks
  remark: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  result: {
    type: String,
    enum: ['Pass', 'Fail', 'Pending'],
    default: 'Pending'
  }
});


const placedInfoSchema = new mongoose.Schema({
  companyRef: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  interviewRecordId: { type: mongoose.Schema.Types.ObjectId }, // Which interview led to placement
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
  roundName: { type: String, required: true }, // e.g., "HR Round", "Technical Round"
  date: { type: Date, required: true },
  mode: { type: String, enum: ['Online', 'Offline', 'Telephonic'], default: 'Offline' },
  feedback: { type: String, default: "" },
  result: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Pending' }
});

const interviewRecord = new mongoose.Schema({
  companyRef: {type: mongoose.Schema.Types.ObjectId,
    ref:"Company",
     required: true
  },
  jobProfile: { type: String, required: true },
  
  status: {
    type: String,
    enum: ['Scheduled', 'Rescheduled', 'Ongoing', 'Selected', 'RejectedByStudent', 'RejectedByCompany'],
    default: 'Scheduled'
  },
  scheduleDate: { type: Date, required: true },
  rescheduleDate: { type: Date },
  rounds: { type: [interviewRoundSchema], default: [] }, // Multiple rounds tracking
  offerLetterURL: { type: String, default: "" },
  applicationLetterURL: { type: String, default: "" },
  internshipToJobUpdate: {
    isIntern: { type: Boolean, default: false },
    internshipEndDate:{ type: String, default: "" }, 
    updatedJobProfile:  { type: String, default: "" }
  }
});

const permissionSchema = new mongoose.Schema({
  imageURL: { type: String, required: true },  // Base64 Image
  remark: { type: String, default: "" },
  uploadDate: { type: Date, default: Date.now },
  approved_by: {
    type: String,
    enum: ['super admin', 'admin', 'faculty'],
    required: true
  }
});

const AdmittedStudentSchema = new mongoose.Schema({
  admissionRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentAdmissionProcess",
    required: true,
    unique: true
  },

  // 🎓 Personal Details
  prkey: { type: String, required: true, unique: true },
  image: { type: String, default: "" }, // Base64 Image
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String },
  studentMobile: { type: String, required: true },
  parentMobile: { type: String, required: true },
  gender: { type: String },
  dob: { type: Date },
  aadharCard: { type: String, unique: true },
  address: { type: String, required: true },
  track: { type: String},
  village: { type: String, required: true },
  stream: { type: String },
  course: { type: String, required: true },
  category: { type: String },
  subject12: { type: String },
  year12: { type: String },
  percent12: { type: String },
  percent10: { type: String },
  year: { type: String, required: true, default: "first" },
  
  // 📚 Academic & Activity
  currentLevel: { type: String, default: "1A" }, // e.g., "Level 1
  level: { type: [levelSchema], default: [] },

  techno: { type: String, default: "" },
  // attendancePercentage: { type: Number, min: 0, max: 100, default: 0 },

  // 🧑‍💼 Placement
  placedInfo: { type: placedInfoSchema, default: null },

  // 🗓️ Interviews
  PlacementinterviewRecord: { type: [interviewRecord], default: [] },

  // Permission
  permissionDetails: { type: permissionSchema, default: null },

  // 🚦 Status
  readinessStatus: {
    type: String,
    enum: ['Ready', 'Not Ready'],
    default: 'Not Ready'
  },
  resumeURL: { type: String, default: "" },

  // 📄 Placement Documents (after placement)
  offerLetter: { type: String, default: "" }, // Base64 image/PDF
  commitmentApplication: { type: String, default: "" }, // Base64 image
  documentsUploadedBy: { type: String, default: "" },
  documentsUploadedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model("AdmittedStudent", AdmittedStudentSchema);

