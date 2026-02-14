const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  role: { 
    type: String, 
    required: true,
    enum: ['superadmin', 'admin', 'faculty']
  },
  permissions: {
    // Dashboard Section
    dashboard: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    attendanceDetails: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    
    // Admission Section
    admissionProcess: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    admissionEditPage: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    
    // Student Section
    studentDashboard: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentDetailTable: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentEditPage: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentProfile: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentReport: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentReportForm: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentLevelData: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentLevelInterviewHistory: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    studentPermission: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    taskList: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    
    // Placement Section
    placementReadyStudents: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    placementRecords: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    placementPost: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    companyDetail: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    placedStudents: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    interviewHistory: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    interviewRoundsHistory: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    
    // User Management Section
    usersManagement: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    userProfile: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    permissionManagement: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      add: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Permission", PermissionSchema);