

import { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Edit, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useDeleteUserMutation, useEditUserMutation, useSignupMutation } from '../../../redux/api/authApi';
import CommonTable from '../../shared/table/CommonTable';
import TabsCommon from '../../shared/table/TabsCommon';
import Loader from '../../shared/loader/Loader';
import InputField from '../../shared/form-fields/InputField';
import CustomDropdown from '../../shared/form-fields/CustomDropdown';
import { Formik, Form } from 'formik';
import { buttonStyles } from '../../../styles/buttonStyles';
import profile from '../../../assets/images/profile-img.png';
import RolesPermissions from './RolesPermissions';
import OrangeButton from '../../shared/sidebar/OrangeButton';
import { usePermissions } from '../../../hooks/usePermissions';
import SearchBox from '../../shared/search-export/SearchBox';
import ExportDropdown from '../../shared/search-export/ExportDropdown';
import Header from '../../shared/sidebar/Header';

const UsersManagement = () => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const createUserFormRef = useRef();
    const [activeTab, setActiveTab] = useState('Users');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(null);
    const [editModal, setEditModal] = useState({ show: false, user: null });

    const { data: usersData, isLoading: loading, error } = useGetAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [editUser] = useEditUserMutation();
    const [createUser] = useSignupMutation();

    const tabs = ['Users', 'Roles & Permissions'];
    const users = usersData?.users || [];

    const filterableColumns = [
        { label: 'Role', key: 'role' },
        { label: 'Department', key: 'department' },
        { label: 'Status', key: 'isActive' },
    ];

    const displayData = useMemo(() => {
        const base = filteredUsers ?? users;
        if (!searchTerm) return base;
        return base.filter((u) =>
            [u.name, u.email, u.mobileNo].some((v) =>
                v?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [filteredUsers, users, searchTerm]);

    const exportData = useMemo(() => users.map(u => ({
        Name: u.name || '',
        Email: u.email || '',
        'Contact No': u.mobileNo || '',
        Role: u.role || '',
        Department: u.department || '',
        Position: u.position || '',
        Status: u.isActive ? 'Active' : 'Inactive'
    })), [users]);

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
            try {
                await deleteUser(userId).unwrap();
                toast.success('User deleted successfully');
            } catch {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleCreateUser = async (values, { resetForm }) => {
        try {
            await createUser(values).unwrap();
            toast.success('User created successfully');
            resetForm();
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to create user');
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'superadmin': return 'bg-red-100 text-red-800';
            case 'admin': return 'bg-blue-100 text-blue-800';
            case 'faculty': return 'bg-green-100 text-green-800';
            case 'chairman': return 'bg-purple-100 text-purple-800';
            case 'ceo': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const CreateUserForm = ({ formikRef }) => {
        const [autoGenerate, setAutoGenerate] = useState(false);
        const [showPassword, setShowPassword] = useState(false);

        const generatePassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
            return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        };

        return (
            <Formik
                innerRef={formikRef}
                initialValues={{ name: '', email: '', mobileNo: '', adharCard: '', role: '', department: '', position: '', isActive: true, password: '' }}
                onSubmit={handleCreateUser}
            >
                {({ setFieldValue, values }) => (
                    <Form className="space-y-4">
                        <InputField label="Full Name" name="name" placeholder="Enter full name" />
                        <InputField label="Email Address" name="email" type="email" placeholder="user@ssism.org" />
                        <InputField label="Mobile Number" name="mobileNo" placeholder="Enter mobile number" />
                        <InputField label="Aadhar Number" name="adharCard" placeholder="Enter Aadhar number" />
                        <div className="grid grid-cols-2 gap-4">
                            <CustomDropdown label="Role" name="role" options={[{ value: 'faculty', label: 'Faculty' }, { value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Super Admin' }]} />
                            <CustomDropdown label="Department" name="department" options={[{ value: 'SSISM', label: 'SSISM' }, { value: 'ITEG', label: 'ITEG' }, { value: 'MEG', label: 'MEG' }, { value: 'BEG', label: 'BEG' }, { value: 'BTECH', label: 'BTECH' }]} />
                        </div>
                        <CustomDropdown label="Position" name="position" options={[{ value: 'Assistant Professor', label: 'Assistant Professor' }, { value: 'Associate Professor', label: 'Associate Professor' }, { value: 'Professor', label: 'Professor' }, { value: 'Lecturer', label: 'Lecturer' }, { value: 'Chairman', label: 'Chairman' }, { value: 'CEO', label: 'CEO' }]} />

                        <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-5 py-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800">Status</label>
                                <p className="text-sm text-gray-500">If the account is active</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFieldValue('isActive', !values.isActive)}
                                    className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none ${values.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-md transition-transform duration-300 ${values.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-medium text-gray-800">{values.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="autoGenerate"
                                        checked={autoGenerate}
                                        onChange={(e) => {
                                            setAutoGenerate(e.target.checked);
                                            if (e.target.checked) setFieldValue('password', generatePassword());
                                        }}
                                        className="w-4 h-4 accent-gray-700"
                                    />
                                    <label htmlFor="autoGenerate" className="text-sm text-gray-600">Autogenerated password</label>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={values.password}
                                    onChange={(e) => setFieldValue('password', e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        );
    };

    const columns = [
        {
            key: 'name', label: 'Name',
            render: (user) => (
                <div className="flex items-center">
                    <img className="h-8 w-8 rounded-full object-cover mr-3" src={user.profileImage || profile} alt={user.name} />
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.position}</div>
                    </div>
                </div>
            )
        },
        { key: 'email', label: 'Email' },
        { key: 'mobileNo', label: 'Contact No.' },
        {
            key: 'role', label: 'Role',
            render: (user) => <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
        },
        { key: 'department', label: 'Department' },
        {
            key: 'isActive', label: 'Status',
            render: (user) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </span>
            )
        },
    ];

    const actionButton = (user) => (
        <div className="flex space-x-2">
            <button onClick={() => setEditModal({ show: true, user })} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Edit User">
                <Edit size={14} />
            </button>
            <button onClick={() => handleDeleteUser(user._id || user.id, user.name)} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Delete User">
                <Trash2 size={14} />
            </button>
        </div>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader /></div>;
    if (error) return <div className="p-6 text-center text-red-500">Error loading users. Please try again.</div>;

    return (
        <>
            <Header title="User Management">
                <div className="flex items-center gap-3">
                    <ExportDropdown data={exportData} sectionName="users" />
                    {hasPermission('Button_CreateUser', 'read') && (
                        <OrangeButton
                            buttonTitle="+ Create New"
                            panelTitle="Create New User"
                            drawerContent={<CreateUserForm formikRef={createUserFormRef} />}
                            rightBtnText="Create User"
                            onRightClick={() => createUserFormRef.current?.submitForm()}
                        />
                    )}
                </div>
            </Header>

            <div className="flex items-center border-b border-gray-200 bg-white">
                <div className="flex-1 min-w-0">
                    <TabsCommon tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
                <div className="flex-shrink-0 px-4">
                    <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
            </div>

            <div className="p-5">
                {activeTab === 'Users' ? (
                    <CommonTable
                        columns={columns}
                        data={displayData}
                        searchTerm={searchTerm}
                        pagination={true}
                        editable={true}
                        actionButton={actionButton}
                        onRowClick={(user) => navigate(`/user-profile/${user._id || user.id}`)}
                        rowsPerPage={10}
                    />
                ) : (
                    <RolesPermissions />
                )}
            </div>

            <OrangeButton
                isOpen={editModal.show}
                onClose={() => setEditModal({ show: false, user: null })}
                panelTitle="Edit User"
                panelSubtitle="Update user profile information and department role."
                showFooter={false}
                maxWidth="sm:max-w-xl"
                drawerContent={
                    <Formik
                        initialValues={{ name: editModal.user?.name || '', position: editModal.user?.position || '', role: editModal.user?.role || '', department: editModal.user?.department || '', isActive: editModal.user?.isActive ?? true }}
                        onSubmit={async (values) => {
                            try {
                                await editUser({ id: editModal.user._id || editModal.user.id, ...values }).unwrap();
                                toast.success('User updated successfully');
                                setEditModal({ show: false, user: null });
                            } catch {
                                toast.error('Failed to update user');
                            }
                        }}
                    >
                        <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2 text-sm font-semibold text-gray-600 mt-2">User Information</div>
                            <div className="col-span-2 md:col-span-1"><InputField label="Name" name="name" placeholder="Enter user name" /></div>
                            <div className="col-span-2 md:col-span-1">
                                <CustomDropdown label="Position" name="position" options={[{ value: 'Assistant Professor', label: 'Assistant Professor' }, { value: 'Associate Professor', label: 'Associate Professor' }, { value: 'Professor', label: 'Professor' }, { value: 'Lecturer', label: 'Lecturer' }, { value: 'Chairman', label: 'Chairman' }, { value: 'CEO', label: 'CEO' }]} />
                            </div>
                            <div className="col-span-2 text-sm font-semibold text-gray-600 mt-2">Access & Department</div>
                            <div className="col-span-2 md:col-span-1">
                                <CustomDropdown label="Role" name="role" options={[{ value: 'faculty', label: 'Faculty' }, { value: 'admin', label: 'Admin' }, { value: 'superadmin', label: 'Super Admin' }]} />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <CustomDropdown label="Department" name="department" options={[{ value: 'SSISM', label: 'SSISM' }, { value: 'ITEG', label: 'ITEG' }, { value: 'MEG', label: 'MEG' }, { value: 'BEG', label: 'BEG' }, { value: 'BTECH', label: 'BTECH' }]} />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <CustomDropdown label="Status" name="isActive" options={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]} />
                            </div>
                            <div className="col-span-2 flex gap-3 pt-6">
                                <button type="button" onClick={() => setEditModal({ show: false, user: null })} className={`flex-1 py-3 font-medium ${buttonStyles.secondary}`}>Cancel</button>
                                <button type="submit" className={`flex-1 py-3 font-medium ${buttonStyles.primary}`}>Save Changes</button>
                            </div>
                        </Form>
                    </Formik>
                }
            />
        </>
    );
};

export default UsersManagement;
