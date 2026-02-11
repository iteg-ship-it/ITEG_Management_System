import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetUserByIdQuery, useGetUserPermissionsQuery, useUpdateSpecificPermissionMutation } from '../../redux/api/authApi';
import PageNavbar from '../common-components/navbar/PageNavbar';
import Loader from '../common-components/loader/Loader';
import profile from '../../assets/images/profile-img.png';

const PermissionAccessSystem = () => {
  const { userId } = useParams();
  const { data: userData, isLoading: userLoading, error: userError } = useGetUserByIdQuery(userId);
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = useGetUserPermissionsQuery(userId);
  const [updateSpecificPermission] = useUpdateSpecificPermissionMutation();
  
  const [permissions, setPermissions] = useState({});

  const user = userData?.user;
  const isLoading = userLoading || permissionsLoading;
  const error = userError || permissionsError;

  useEffect(() => {
    if (permissionsData?.permissions?.permissions) {
      setPermissions(permissionsData.permissions.permissions);
    }
  }, [permissionsData]);

  const handlePermissionToggle = async (permissionKey, actionType) => {
    try {
      const currentValue = permissions[permissionKey]?.[actionType] || false;
      const newValue = !currentValue;
      
      // Optimistic update
      setPermissions(prev => ({
        ...prev,
        [permissionKey]: {
          ...prev[permissionKey],
          [actionType]: newValue
        }
      }));

      // API call
      await updateSpecificPermission({
        userId,
        page: permissionKey,
        action: actionType,
        value: newValue
      }).unwrap();

      toast.success(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} permission ${newValue ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
      
      // Revert optimistic update on error
      setPermissions(prev => ({
        ...prev,
        [permissionKey]: {
          ...prev[permissionKey],
          [actionType]: !prev[permissionKey]?.[actionType]
        }
      }));
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
                            ? 'bg-green-500 text-white border border-green-600 hover:bg-green-600'
                            : 'bg-red-500 text-white border border-red-600 hover:bg-red-600'
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