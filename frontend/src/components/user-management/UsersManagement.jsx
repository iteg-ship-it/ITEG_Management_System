import { useState } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Edit, Eye, X } from 'lucide-react';
import { useGetAllUsersQuery, useDeleteUserMutation, useEditUserMutation } from '../../redux/api/authApi';
import CommonTable from '../common-components/table/CommonTable';
import Pagination from '../common-components/pagination/Pagination';
import Loader from "../common-components/loader/Loader";
import InputField from '../common-components/common-feild/InputField';
import CustomDropdown from '../common-components/common-feild/CustomDropdown';
import { Formik, Form } from 'formik';
import { buttonStyles } from '../../styles/buttonStyles';
import PageNavbar from '../common-components/navbar/PageNavbar';

const UsersManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [editModal, setEditModal] = useState({ show: false, user: null });
    const { data: usersData, isLoading: loading, error } = useGetAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [editUser] = useEditUserMutation();

    const users = usersData?.users || [];
    const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
    const roles = [...new Set(users.map(user => user.role).filter(Boolean))];

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
            try {
                await deleteUser(userId).unwrap();
                toast.success('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleEditUser = (user) => {
        setEditModal({ show: true, user });
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
                        src={user.profileImage || '/default-avatar.png'}
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
            label: 'Contact',
            render: (user) => (
                <div>
                    <div>{user.email}</div>
                    <div className="text-sm text-gray-500">{user.mobileNo}</div>
                </div>
            )
        },
        {
            key: 'role',
            label: 'Role & Department',
            render: (user) => (
                <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">{user.department}</div>
                </div>
            )
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (user) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];

    const actionButton = (user) => (
        <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-900" title="View Details">
                <Eye size={16} />
            </button>
            <button
                onClick={() => handleEditUser(user)}
                className="text-green-600 hover:text-green-900"
                title="Edit User"
            >
                <Edit size={16} />
            </button>
            <button
                onClick={() => handleDeleteUser(user.id, user.name)}
                className="text-red-600 hover:text-red-900"
                title="Delete User"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <>
            <PageNavbar
                title="Users Management"
                subtitle="Manage all system users"
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
                    rowsPerPage={10}
                />
            </div>

            {editModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl py-4 px-6 w-full max-w-2xl relative">
                        <button
                            onClick={() => setEditModal({ show: false, user: null })}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]">Edit User</h2>

                        <Formik
                            initialValues={{
                                name: editModal.user?.name || '',
                                position: editModal.user?.position || '',
                                role: editModal.user?.role || '',
                                department: editModal.user?.department || '',
                                isActive: editModal.user?.isActive || true
                            }}
                            onSubmit={async (values) => {
                                try {
                                    await editUser({ id: editModal.user.id, ...values }).unwrap();
                                    toast.success('User updated successfully');
                                    setEditModal({ show: false, user: null });
                                } catch (error) {
                                    console.error('Error updating user:', error);
                                    toast.error('Failed to update user');
                                }
                            }}
                        >
                            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2 text-sm font-semibold text-gray-600 mt-2">User Information</div>

                                <div className="col-span-2 md:col-span-1">
                                    <InputField label="Name" name="name" />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <CustomDropdown
                                        label="Position"
                                        name="position"
                                        options={[
                                            { value: 'Assistant Professor', label: 'Assistant Professor' },
                                            { value: 'Associate Professor', label: 'Associate Professor' },
                                            { value: 'Professor', label: 'Professor' },
                                            { value: 'Lecturer', label: 'Lecturer' },
                                            { value: 'Chairman', label: 'Chairman' },
                                            { value: 'CEO', label: 'CEO' }
                                        ]}
                                    />
                                </div>

                                <div className="col-span-2 text-sm font-semibold text-gray-600 mt-4">Access & Department</div>

                                <div className="col-span-2 md:col-span-1">
                                    <CustomDropdown
                                        label="Role"
                                        name="role"
                                        options={[
                                            { value: 'faculty', label: 'Faculty' },
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'superadmin', label: 'Super Admin' }
                                        ]}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <CustomDropdown
                                        label="Department"
                                        name="department"
                                        options={[
                                            { value: 'SSISM', label: 'SSISM' },
                                            { value: 'ITEG', label: 'ITEG' },
                                            { value: 'MEG', label: 'MEG' },
                                            { value: 'BEG', label: 'BEG' },
                                            { value: 'BTECH', label: 'BTECH' }
                                        ]}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <CustomDropdown
                                        label="Status"
                                        name="isActive"
                                        options={[
                                            { value: true, label: 'Active' },
                                            { value: false, label: 'Inactive' }
                                        ]}
                                    />
                                </div>

                                <div className="col-span-2 flex gap-3 pt-6">
                                    <button
                                        type="submit"
                                        className={`flex-1 py-3 font-medium ${buttonStyles.primary}`}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditModal({ show: false, user: null })}
                                        className={`flex-1 py-3 font-medium ${buttonStyles.secondary}`}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Form>
                        </Formik>
                    </div>
                </div>
            )}
        </>
    );
};

export default UsersManagement;