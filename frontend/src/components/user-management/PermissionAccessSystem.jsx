import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetUserByIdQuery, useEditUserMutation } from '../../redux/api/authApi';
import PageNavbar from '../common-components/navbar/PageNavbar';
import Loader from '../common-components/loader/Loader';
import profile from '../../assets/images/profile-img.png';

const PermissionAccessSystem = () => {
  const { userId } = useParams();
  const { data: userData, isLoading, error } = useGetUserByIdQuery(userId);
  const [editUser] = useEditUserMutation();
  
  const [permissions, setPermissions] = useState({
    dashboard: { view: true, edit: true, add: false, delete: false },
    attendanceDetails: { view: true, edit: true, add: false, delete: false },
    admissionProcess: { view: true, edit: true, add: true, delete: false },
    admissionEditPage: { view: true, edit: true, add: false, delete: false },
    studentDashboard: { view: true, edit: true, add: true, delete: false },
    studentDetailTable: { view: true, edit: true, add: false, delete: false },
    studentEditPage: { view: true, edit: true, add: false, delete: false },
    studentProfile: { view: true, edit: true, add: false, delete: false },
    studentReport: { view: true, edit: true, add: false, delete: false },
    studentReportForm: { view: true, edit: true, add: false, delete: false },
    studentLevelData: { view: true, edit: true, add: false, delete: false },
    studentLevelInterviewHistory: { view: true, edit: true, add: false, delete: false },
    studentPermission: { view: true, edit: true, add: false, delete: false },
    placementReadyStudents: { view: true, edit: true, add: true, delete: false },
    placementRecords: { view: true, edit: true, add: false, delete: false },
    placementPost: { view: true, edit: true, add: true, delete: false },
    companyDetail: { view: true, edit: true, add: true, delete: false },
    placedStudents: { view: true, edit: true, add: false, delete: false },
    interviewHistory: { view: true, edit: true, add: false, delete: false },
    interviewRoundsHistory: { view: true, edit: true, add: false, delete: false },
    usersManagement: { view: false, edit: false, add: false, delete: false },
    userProfile: { view: false, edit: false, add: false, delete: false },
    permissionManagement: { view: false, edit: false, add: false, delete: false },
  });

  const user = userData?.user;

  useEffect(() => {
    if (user) {
      const rolePermissions = {
        superadmin: {
          dashboard: { view: true, edit: true, add: true, delete: true },
          attendanceDetails: { view: true, edit: true, add: true, delete: true },
          admissionProcess: { view: true, edit: true, add: true, delete: true },
          admissionEditPage: { view: true, edit: true, add: true, delete: true },
          studentDashboard: { view: true, edit: true, add: true, delete: true },
          studentDetailTable: { view: true, edit: true, add: true, delete: true },
          studentEditPage: { view: true, edit: true, add: true, delete: true },
          studentProfile: { view: true, edit: true, add: true, delete: true },
          studentReport: { view: true, edit: true, add: true, delete: true },
          studentReportForm: { view: true, edit: true, add: true, delete: true },
          studentLevelData: { view: true, edit: true, add: true, delete: true },
          studentLevelInterviewHistory: { view: true, edit: true, add: true, delete: true },
          studentPermission: { view: true, edit: true, add: true, delete: true },
          placementReadyStudents: { view: true, edit: true, add: true, delete: true },
          placementRecords: { view: true, edit: true, add: true, delete: true },
          placementPost: { view: true, edit: true, add: true, delete: true },
          companyDetail: { view: true, edit: true, add: true, delete: true },
          placedStudents: { view: true, edit: true, add: true, delete: true },
          interviewHistory: { view: true, edit: true, add: true, delete: true },
          interviewRoundsHistory: { view: true, edit: true, add: true, delete: true },
          usersManagement: { view: true, edit: true, add: true, delete: true },
          userProfile: { view: true, edit: true, add: true, delete: true },
          permissionManagement: { view: true, edit: true, add: true, delete: true },
        },
        admin: {
          dashboard: { view: true, edit: true, add: true, delete: false },
          attendanceDetails: { view: true, edit: true, add: true, delete: false },
          admissionProcess: { view: true, edit: true, add: true, delete: false },
          admissionEditPage: { view: true, edit: true, add: true, delete: false },
          studentDashboard: { view: true, edit: true, add: true, delete: false },
          studentDetailTable: { view: true, edit: true, add: true, delete: false },
          studentEditPage: { view: true, edit: true, add: true, delete: false },
          studentProfile: { view: true, edit: true, add: true, delete: false },
          studentReport: { view: true, edit: true, add: true, delete: false },
          studentReportForm: { view: true, edit: true, add: true, delete: false },
          studentLevelData: { view: true, edit: true, add: true, delete: false },
          studentLevelInterviewHistory: { view: true, edit: true, add: true, delete: false },
          studentPermission: { view: true, edit: true, add: true, delete: false },
          placementReadyStudents: { view: true, edit: true, add: true, delete: false },
          placementRecords: { view: true, edit: true, add: true, delete: false },
          placementPost: { view: true, edit: true, add: true, delete: false },
          companyDetail: { view: true, edit: true, add: true, delete: false },
          placedStudents: { view: true, edit: true, add: true, delete: false },
          interviewHistory: { view: true, edit: true, add: true, delete: false },
          interviewRoundsHistory: { view: true, edit: true, add: true, delete: false },
          usersManagement: { view: false, edit: false, add: false, delete: false },
          userProfile: { view: false, edit: false, add: false, delete: false },
          permissionManagement: { view: false, edit: false, add: false, delete: false },
        },
        faculty: {
          dashboard: { view: true, edit: false, add: false, delete: false },
          attendanceDetails: { view: true, edit: false, add: false, delete: false },
          admissionProcess: { view: true, edit: true, add: false, delete: false },
          admissionEditPage: { view: true, edit: true, add: false, delete: false },
          studentDashboard: { view: true, edit: true, add: false, delete: false },
          studentDetailTable: { view: true, edit: true, add: false, delete: false },
          studentEditPage: { view: true, edit: true, add: false, delete: false },
          studentProfile: { view: true, edit: true, add: false, delete: false },
          studentReport: { view: true, edit: true, add: false, delete: false },
          studentReportForm: { view: true, edit: true, add: false, delete: false },
          studentLevelData: { view: true, edit: true, add: false, delete: false },
          studentLevelInterviewHistory: { view: true, edit: true, add: false, delete: false },
          studentPermission: { view: true, edit: false, add: false, delete: false },
          placementReadyStudents: { view: true, edit: false, add: false, delete: false },
          placementRecords: { view: true, edit: false, add: false, delete: false },
          placementPost: { view: true, edit: false, add: false, delete: false },
          companyDetail: { view: true, edit: false, add: false, delete: false },
          placedStudents: { view: true, edit: false, add: false, delete: false },
          interviewHistory: { view: true, edit: false, add: false, delete: false },
          interviewRoundsHistory: { view: true, edit: false, add: false, delete: false },
          usersManagement: { view: false, edit: false, add: false, delete: false },
          userProfile: { view: false, edit: false, add: false, delete: false },
          permissionManagement: { view: false, edit: false, add: false, delete: false },
        },
      };
      
      setPermissions(rolePermissions[user.role?.toLowerCase()] || {});
    }
  }, [user]);

  const handlePermissionToggle = async (permissionKey, actionType) => {
    const newPermissions = {
      ...permissions,
      [permissionKey]: {
        ...permissions[permissionKey],
        [actionType]: !permissions[permissionKey][actionType]
      }
    };
    setPermissions(newPermissions);
    
    try {
      toast.success(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} permission ${newPermissions[permissionKey][actionType] ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
      setPermissions(permissions);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500">Error loading user data. Please try again.</p>
        </div>
      </div>
    );
  }

  const permissionItems = [
    { key: 'dashboard', name: 'Dashboard', description: 'Main dashboard page', icon: '📊' },
    { key: 'attendanceDetails', name: 'Attendance Details', description: 'View attendance records', icon: '📅' },
    { key: 'admissionProcess', name: 'Admission Process', description: 'Admission workflow page', icon: '📝' },
    { key: 'admissionEditPage', name: 'Admission Edit Page', description: 'Edit admission records', icon: '✏️' },
    { key: 'studentDashboard', name: 'Student Dashboard', description: 'Student progress dashboard', icon: '👨🎓' },
    { key: 'studentDetailTable', name: 'Student Detail Table', description: 'Student information table', icon: '📋' },
    { key: 'studentEditPage', name: 'Student Edit Page', description: 'Edit student records', icon: '📝' },
    { key: 'studentProfile', name: 'Student Profile', description: 'Individual student profiles', icon: '👤' },
    { key: 'studentReport', name: 'Student Report', description: 'Student performance reports', icon: '📊' },
    { key: 'studentReportForm', name: 'Student Report Form', description: 'Create/edit student reports', icon: '📄' },
    { key: 'studentLevelData', name: 'Student Level Data', description: 'Student level information', icon: '📈' },
    { key: 'studentLevelInterviewHistory', name: 'Student Level Interview History', description: 'Interview history by level', icon: '🎤' },
    { key: 'studentPermission', name: 'Student Permission', description: 'Dummy students management', icon: '🔐' },
    { key: 'placementReadyStudents', name: 'Placement Ready Students', description: 'Students ready for placement', icon: '🎯' },
    { key: 'placementRecords', name: 'Placement Records', description: 'Placement interview records', icon: '📝' },
    { key: 'placementPost', name: 'Placement Post', description: 'Placed students records', icon: '💼' },
    { key: 'companyDetail', name: 'Company Detail', description: 'Company information management', icon: '🏢' },
    { key: 'placedStudents', name: 'Placed Students', description: 'Students placed in companies', icon: '✅' },
    { key: 'interviewHistory', name: 'Interview History', description: 'Student interview history', icon: '📋' },
    { key: 'interviewRoundsHistory', name: 'Interview Rounds History', description: 'Detailed interview rounds', icon: '🔄' },
    { key: 'usersManagement', name: 'Users Management', description: 'System users management', icon: '👥' },
    { key: 'userProfile', name: 'User Profile', description: 'Individual user profiles', icon: '👤' },
    { key: 'permissionManagement', name: 'Permission Management', description: 'User permissions control', icon: '🔒' },
  ];

  return (
    <>
      <PageNavbar
        title="Permission Access of System"
        subtitle={`Manage system permissions for ${user.name}`}
        showBackButton={true}
      />

      <div className="p-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center">
            <img
              className="h-16 w-16 rounded-full object-cover mr-4"
              src={user.profileImage || profile}
              alt={user.name}
            />
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">{user.position}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role?.toLowerCase() === 'superadmin' ? 'bg-red-100 text-red-800' :
                  user.role?.toLowerCase() === 'admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Permissions</h3>
            
            <div className="space-y-4">
              {permissionItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="text-2xl mr-4">{item.icon}</span>
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['view', 'edit', 'add', 'delete'].map((action) => (
                      <button
                        key={action}
                        onClick={() => handlePermissionToggle(item.key, action)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          permissions[item.key]?.[action]
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}
                      >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionAccessSystem;