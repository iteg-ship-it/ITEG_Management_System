import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosInstance';
import { toast } from 'react-toastify';

const PermissionManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);

  const pages = [
    'dashboard', 'attendanceDetails', 'admissionProcess', 'admissionEditPage',
    'studentDashboard', 'studentDetailTable', 'studentEditPage', 'studentProfile',
    'studentReport', 'studentReportForm', 'studentLevelData', 'studentLevelInterviewHistory',
    'studentPermission', 'placementReadyStudents', 'placementRecords', 'placementPost',
    'companyDetail', 'placedStudents', 'interviewHistory', 'interviewRoundsHistory',
    'usersManagement', 'userProfile', 'permissionManagement'
  ];

  const actions = ['view', 'edit', 'add', 'delete'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/user/all');
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchUserPermissions = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/permissions/user/${userId}`);
      setPermissions(response.data.permissions?.permissions || {});
    } catch (error) {
      toast.error('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = (page, action, value) => {
    setPermissions(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [action]: value
      }
    }));
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await api.patch(`/permissions/user/${selectedUser.id}/permission`, {
        permissions
      });
      toast.success('Permissions updated successfully');
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Permission Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="space-y-2">
            {users.map(user => (
              <div
                key={user.id}
                className={`p-3 rounded cursor-pointer ${
                  selectedUser?.id === user.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  fetchUserPermissions(user.id);
                }}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-blue-600">{user.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          {selectedUser ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Permissions for {selectedUser.name}
                </h2>
                <button
                  onClick={savePermissions}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Page</th>
                      {actions.map(action => (
                        <th key={action} className="text-center p-2 capitalize">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map(page => (
                      <tr key={page} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium capitalize">
                          {page.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        {actions.map(action => (
                          <td key={action} className="text-center p-2">
                            <button
                              onClick={() => updatePermission(page, action, !permissions[page]?.[action])}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                permissions[page]?.[action] 
                                  ? 'bg-green-200 text-green-800 hover:bg-green-300' 
                                  : 'bg-red-200 text-red-800 hover:bg-red-300'
                              }`}
                              style={{
                                backgroundColor: permissions[page]?.[action] ? '#bbf7d0' : '#fecaca',
                                color: permissions[page]?.[action] ? '#166534' : '#991b1b'
                              }}
                            >
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </button>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a user to manage permissions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionManagement;