const User = require("../models/user/user");
const Permission = require("../models/user/permission");

const getDefaultPermissions = (role) => {
  const basePermissions = {
    dashboard: { view: false, edit: false, add: false, delete: false },
    attendanceDetails: { view: false, edit: false, add: false, delete: false },
    admissionProcess: { view: false, edit: false, add: false, delete: false },
    admissionEditPage: { view: false, edit: false, add: false, delete: false },
    studentDashboard: { view: false, edit: false, add: false, delete: false },
    studentDetailTable: { view: false, edit: false, add: false, delete: false },
    studentEditPage: { view: false, edit: false, add: false, delete: false },
    studentProfile: { view: false, edit: false, add: false, delete: false },
    studentReport: { view: false, edit: false, add: false, delete: false },
    studentReportForm: { view: false, edit: false, add: false, delete: false },
    studentLevelData: { view: false, edit: false, add: false, delete: false },
    studentLevelInterviewHistory: { view: false, edit: false, add: false, delete: false },
    studentPermission: { view: false, edit: false, add: false, delete: false },
    placementReadyStudents: { view: false, edit: false, add: false, delete: false },
    placementRecords: { view: false, edit: false, add: false, delete: false },
    placementPost: { view: false, edit: false, add: false, delete: false },
    companyDetail: { view: false, edit: false, add: false, delete: false },
    placedStudents: { view: false, edit: false, add: false, delete: false },
    interviewHistory: { view: false, edit: false, add: false, delete: false },
    interviewRoundsHistory: { view: false, edit: false, add: false, delete: false },
    usersManagement: { view: false, edit: false, add: false, delete: false },
    userProfile: { view: false, edit: false, add: false, delete: false },
    permissionManagement: { view: false, edit: false, add: false, delete: false }
  };

  switch (role?.toLowerCase()) {
    case 'superadmin':
      Object.keys(basePermissions).forEach(key => {
        basePermissions[key] = { view: true, edit: true, add: true, delete: true };
      });
      break;
    case 'admin':
      Object.keys(basePermissions).forEach(key => {
        if (!['usersManagement', 'userProfile', 'permissionManagement'].includes(key)) {
          basePermissions[key] = { view: true, edit: true, add: true, delete: false };
        }
      });
      break;
    case 'faculty':
      const facultyPages = [
        'dashboard', 'attendanceDetails', 'admissionProcess', 'admissionEditPage',
        'studentDashboard', 'studentDetailTable', 'studentEditPage', 'studentProfile',
        'studentReport', 'studentReportForm', 'studentLevelData', 'studentLevelInterviewHistory'
      ];
      facultyPages.forEach(key => {
        basePermissions[key] = { view: true, edit: true, add: false, delete: false };
      });
      break;
  }
  return basePermissions;
};

const initializePermissionsForExistingUsers = async () => {
  try {
    console.log("🔄 Initializing permissions for existing users...");
    
    const users = await User.find({});
    let created = 0;

    for (const user of users) {
      const existingPermission = await Permission.findOne({ userId: user._id });
      
      if (!existingPermission) {
        const defaultPermissions = getDefaultPermissions(user.role);
        await Permission.create({
          userId: user._id,
          role: user.role,
          permissions: defaultPermissions
        });
        created++;
        console.log(`✅ Created permissions for user: ${user.email}`);
      }
    }

    console.log(`✅ Permission initialization complete: ${created} permissions created`);
    return { created };
  } catch (error) {
    console.error("❌ Error initializing permissions:", error);
    throw error;
  }
};

module.exports = {
  getDefaultPermissions,
  initializePermissionsForExistingUsers
};