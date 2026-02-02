import { useState } from 'react';
import { toast } from 'react-toastify';
import { Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useEditUserMutation } from '../../redux/api/authApi';
import CommonTable from '../common-components/table/CommonTable';
import Pagination from '../common-components/pagination/Pagination';
import Loader from "../common-components/loader/Loader";
import PageNavbar from '../common-components/navbar/PageNavbar';
import profile from '../../assets/images/profile-img.png';

const PermissionManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const { data: usersData, isLoading: loading, error } = useGetAllUsersQuery();
  const [editUser] = useEditUserMutation();

  const users = usersData?.users || [];
  const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
  const roles = [...new Set(users.map(user => user.role).filter(Boolean))];

  const handleViewUser = (userId) => {
    navigate(`/permission-access/${userId}`);
  };

  const handleEditPermissions = async (user) => {
    // Toggle user active status as permission management
    try {
      await editUser({ 
        id: user.id, 
        isActive: !user.isActive 
      }).unwrap();
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user permissions:', error);
      toast.error('Failed to update user permissions');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-500">Error loading users. Please try again.</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'faculty':
        return 'bg-green-100 text-green-800';
      case 'chairman':
        return 'bg-purple-100 text-purple-800';
      case 'ceo':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="flex items-center">
          <img
            className="h-8 w-8 rounded-full object-cover mr-3"
            src={user.profileImage || profile}
            alt={user.name}
          />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.position}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'mobileNo',
      label: 'Contact No.',
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
          {user.role}
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
    },
    {
      key: 'isActive',
      label: 'Permission Status',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.isActive ? 'Granted' : 'Revoked'}
        </span>
      )
    }
  ];

  const actionButton = (user) => (
    <div className="flex space-x-1">
      <button
        onClick={() => handleEditPermissions(user)}
        className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        title={user.isActive ? 'Revoke Permissions' : 'Grant Permissions'}
      >
        <Edit size={14} />
      </button>
    </div>
  );

  return (
    <>
      <PageNavbar
        title="Permission Management"
        subtitle="Manage user permissions and access controls"
        showBackButton={true}
      />

      <div className="mt-1 border bg-[var(--backgroundColor)] shadow-sm rounded-lg">
        <div className="px-5 flex justify-between items-center flex-wrap gap-4 mt-4">
          <Pagination
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filtersConfig={[
              {
                title: 'Department',
                options: departments,
                selected: selectedDepartments,
                setter: setSelectedDepartments
              },
              {
                title: 'Role',
                options: roles,
                selected: selectedRoles,
                setter: setSelectedRoles
              }
            ]}
            allData={users}
            sectionName="users"
          />
        </div>

        <CommonTable
          columns={columns}
          data={users.filter(user =>
            (selectedDepartments.length === 0 || selectedDepartments.includes(user.department)) &&
            (selectedRoles.length === 0 || selectedRoles.includes(user.role))
          )}
          searchTerm={searchTerm}
          pagination={true}
          editable={true}
          actionButton={actionButton}
          onRowClick={(user) => handleViewUser(user.id)}
          rowsPerPage={10}
        />
      </div>
    </>
  );
};

export default PermissionManagement;