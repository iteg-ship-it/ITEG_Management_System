

import { useState, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Trash2, Edit, X, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery, useDeleteUserMutation, useEditUserMutation , useSignupMutation} from "./../../redux/api/authApi";
import CommonTable from './../common-components/table/CommonTable';
import TabsCommon from './../common-components/table/TabsCommon';
import Loader from "./../common-components/loader/Loader";
import InputField from './../common-components/common-feild/InputField';
import CustomDropdown from './../common-components/common-feild/CustomDropdown';
import { Formik, Form } from 'formik';
import { buttonStyles } from './../../styles/buttonStyles';
import profile from './../../assets/images/profile-img.png';
import RolesPermissions from './RolesPermissions';
import OrangeButton from './../common-components/sidebar/OrangeButton';
import { usePermissions } from './../../hooks/usePermissions';
import SearchBox from './../common-components/seach-export/SearchBox';
import ExportDropdown from './../common-components/seach-export/ExportDropdown';
import Header from './../common-components/sidebar/Header';

const UsersManagement = () => {
    const navigate = useNavigate();
    const { hasPermission } = usePermissions();
    const createUserFormRef = useRef();
    const [activeTab, setActiveTab] = useState('Users');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [editModal, setEditModal] = useState({ show: false, user: null });
    const { data: usersData, isLoading: loading, error } = useGetAllUsersQuery();
    const [deleteUser] = useDeleteUserMutation();
    const [editUser] = useEditUserMutation();
    const [createUser] = useSignupMutation();

    const tabs = ['Users', 'Roles & Permissions'];

    const users = usersData?.users || [];
    const departments = [...new Set(users.map(user => user.department).filter(Boolean))];
    const roles = [...new Set(users.map(user => user.role).filter(Boolean))];

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
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const handleEditUser = (user) => {
        setEditModal({ show: true, user });
    };

    const handleViewUser = (userId) => {
        navigate(`/user-profile/${userId}`);
    };

    const handleCreateUser = async (values, { resetForm }) => {
        try {
            console.log('Creating user with values:', values);
            await createUser(values).unwrap();
            toast.success('User created successfully');
            resetForm();
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error(error?.data?.message || 'Failed to create user');
        }
    };

    const CreateUserForm = ({ formikRef }) => {
        const [isActive, setIsActive] = useState(true);
        const [autoGenerate, setAutoGenerate] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        
        const generatePassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
            let password = '';
            for (let i = 0; i < 12; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };
        
        return (
            <Formik
                innerRef={formikRef}
                initialValues={{
                    name: '',
                    email: '',
                    mobileNo: '',
                    adharCard: '',
                    role: '',
                    department: '',
                    position: '',
                    isActive: true,
                    password: ''
                }}
                onSubmit={handleCreateUser}
            >
                {({ setFieldValue, values }) => (
                    <Form className="space-y-6">
                        <InputField label="Full Name" name="name" placeholder="Enter full name" />
                        
                        <InputField label="Email Address" name="email" type="email" placeholder="user@ssism.org" />
                        
                        <InputField label="Mobile Number" name="mobileNo" placeholder="Enter mobile number" />
                        
                        <InputField label="Aadhar Number" name="adharCard" placeholder="Enter Aadhar number" />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <CustomDropdown
                                label="Role"
                                name="role"
                                options={[
                                    { value: 'faculty', label: 'Faculty' },
                                    { value: 'admin', label: 'Admin' },
                                    { value: 'superadmin', label: 'Super Admin' }
                                ]}
                            />
                            
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
                        
                        <div className="mb-4">
    <div className="flex items-center justify-between bg-gray-50 border rounded-xl px-5 py-4">
        
        {/* Left Content */}
        <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800">
                Status
            </label>
            <p className="text-sm text-gray-500">
                If the account is active
            </p>
        </div>

        {/* Right Content - Toggle + Text */}
        <div className="flex items-center gap-2">
            {/* Toggle Switch */}
            <button
                type="button"
                onClick={() => {
                    const newStatus = !values.isActive;
                    setFieldValue('isActive', newStatus);
                    setIsActive(newStatus);
                }}
                className={`relative inline-flex items-center h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none ${
                    values.isActive ? 'bg-orange-500' : 'bg-gray-300'
                }`}
            >
                <span
                    className={`inline-block w-6 h-6 transform bg-white rounded-full shadow-md transition-transform duration-300 ${
                        values.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
            </button>

            {/* Active Text */}
            <span className="text-sm font-medium text-gray-800">
                {values.isActive ? 'Active' : 'Inactive'}
            </span>
        </div>
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
                                            const checked = e.target.checked;
                                            setAutoGenerate(checked);
                                            if (checked) {
                                                const newPassword = generatePassword();
                                                setFieldValue('password', newPassword);
                                            }
                                        }}
                                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <label htmlFor="autoGenerate" className="text-sm text-gray-600">
                                        Autogenerated password
                                    </label>
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={values.password}
                                    onChange={(e) => setFieldValue('password', e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        );
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
            label: 'Email ',
            // render: (user) => user.email
        }, {
            key: 'mobileNo',
            label: 'Contact No.',
            // render: (user) => user.mobileNo
        },
        {
            key: 'role',
            label: 'Role',
            render: (user) => (
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                </div>
            )
        }, {
            key: 'department',
            label: 'Department',
            // render: (user) => (
            //     <div>
            //         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
            //             {user.role}
            //         </span>
            //         <div className="text-sm text-gray-500 mt-1">{user.department}</div>
            //     </div>
            // )
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
            <button
                onClick={() => handleEditUser(user)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Edit User"
            >
                <Edit size={14} />
            </button>
            <button
                onClick={() => handleDeleteUser(user._id || user.id, user.name)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                title="Delete User"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );

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
                            onRightClick={() => {
                                if (createUserFormRef.current) {
                                    createUserFormRef.current.submitForm();
                                }
                            }}
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
                        data={users.filter(user =>
                            (selectedDepartments.length === 0 || selectedDepartments.includes(user.department)) &&
                            (selectedRoles.length === 0 || selectedRoles.includes(user.role))
                        )}
                        searchTerm={searchTerm}
                        pagination={true}
                        editable={true}
                        actionButton={actionButton}
                        onRowClick={(user) => handleViewUser(user._id || user.id)}
                        rowsPerPage={10}
                    />
                ) : (
                    <RolesPermissions />
                )}
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
                                    await editUser({ id: editModal.user._id || editModal.user.id, ...values }).unwrap();
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
                                    <InputField label="Name" name="name" placeholder="Enter user name" />
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
// import { useState, useMemo } from "react";
// import { toast } from "react-toastify";
// import { Trash2, Edit, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import {
//     useGetAllUsersQuery,
//     useDeleteUserMutation,
//     useEditUserMutation,
//     useSignupMutation,
// } from "../../redux/api/authApi";

// import CommonTable from "./../common-components/table/CommonTable";
// import Loader from "./../common-components/loader/Loader";
// import InputField from "./../common-components/common-feild/InputField";
// import CustomDropdown from "./../common-components/common-feild/CustomDropdown";
// import RadioGroup from "./../common-components/common-feild/RadioGroup";
// import { Formik, Form } from "formik";
// import { buttonStyles } from "./../../styles/buttonStyles";
// import profile from "./../../assets/images/profile-img.png";
// import Header from "./../common-components/sidebar/Header";
// import TabsCommon from "./../common-components/table/TabsCommon";
// import PageNavbar from "./../common-components/navbar/PageNavbar";
// import SearchBox from "./../common-components/seach-export/SearchBox";
// import Export from "./../common-components/seach-export/ExportDropdown";
// import OrangeButton from "./../common-components/sidebar/OrangeButton";

// const UsersManagement = () => {
//     const navigate = useNavigate();

//     const [searchTerm, setSearchTerm] = useState("");
//     const [activeTab, setActiveTab] = useState("All Users");
//     const [editModal, setEditModal] = useState({ show: false, user: null });

//     const { data: usersData, isLoading: loading, error } =
//         useGetAllUsersQuery();

//     const [deleteUser] = useDeleteUserMutation();
//     const [editUser] = useEditUserMutation();
//     const [signup] = useSignupMutation();

//     const users = usersData?.users || [];

//     const tabs = ["All Users", "Active", "Inactive"];

//     /* ===============================
//        FILTER + SEARCH LOGIC
//     =============================== */

//     const filteredUsers = useMemo(() => {
//         let filtered = users;

//         if (activeTab === "Active") {
//             filtered = users.filter((user) => user.isActive);
//         } else if (activeTab === "Inactive") {
//             filtered = users.filter((user) => !user.isActive);
//         }

//         if (searchTerm) {
//             filtered = filtered.filter(
//                 (user) =>
//                     user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                     user.mobileNo?.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }

//         return filtered;
//     }, [users, activeTab, searchTerm]);

//     /* ===============================
//        EXPORT DATA TRANSFORMATION
//     =============================== */

//     const exportData = useMemo(() => {
//         return filteredUsers.map(user => ({
//             Name: user.name || '',
//             Email: user.email || '',
//             'Contact No': user.mobileNo || '',
//             Role: user.role || '',
//             Department: user.department || '',
//             Position: user.position || '',
//             Status: user.isActive ? 'Active' : 'Inactive'
//         }));
//     }, [filteredUsers]);

//     /* ===============================
//        HANDLERS
//     =============================== */

//     const handleDeleteUser = async (userId, userName) => {
//         if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
//             try {
//                 await deleteUser(userId).unwrap();
//                 toast.success("User deleted successfully");
//             } catch (error) {
//                 toast.error("Failed to delete user");
//             }
//         }
//     };

//     const handleEditUser = (user) => {
//         setEditModal({ show: true, user });
//     };

//     const handleViewUser = (userId) => {
//         navigate(`/user-profile/${userId}`);
//     };

//     /* ===============================
//        ROLE BADGE
//     =============================== */

//     const getRoleBadgeColor = (role) => {
//         switch (role?.toLowerCase()) {
//             case "superadmin":
//                 return "bg-red-100 text-red-800";
//             case "admin":
//                 return "bg-blue-100 text-blue-800";
//             case "faculty":
//                 return "bg-green-100 text-green-800";
//             default:
//                 return "bg-gray-100 text-gray-800";
//         }
//     };

//     /* ===============================
//        TABLE COLUMNS
//     =============================== */

//     const columns = [
//         {
//             key: "name",
//             label: "Name",
//             render: (user) => (
//                 <div className="flex items-center">
//                     <img
//                         className="h-8 w-8 rounded-full object-cover mr-3"
//                         src={user.profileImage || profile}
//                         alt={user.name}
//                     />
//                     <div>
//                         <div className="font-medium">{user.name}</div>
//                         <div className="text-sm text-gray-500">
//                             {user.position}
//                         </div>
//                     </div>
//                 </div>
//             ),
//         },
//         { key: "email", label: "Email" },
//         { key: "mobileNo", label: "Contact No." },
//         {
//             key: "role",
//             label: "Role",
//             render: (user) => (
//                 <div
//                     className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
//                         user.role
//                     )}`}
//                 >
//                     {user.role}
//                 </div>
//             ),
//         },
//         { key: "department", label: "Department" },
//         {
//             key: "isActive",
//             label: "Status",
//             render: (user) => (
//                 <span
//                     className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                         }`}
//                 >
//                     {user.isActive ? "Active" : "Inactive"}
//                 </span>
//             ),
//         },
//     ];

//     const actionButton = (user) => (
//         <div className="flex space-x-2">
//             <button
//                 onClick={() => handleEditUser(user)}
//                 className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
//             >
//                 <Edit size={14} />
//             </button>

//             <button
//                 onClick={() => handleDeleteUser(user.id, user.name)}
//                 className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
//             >
//                 <Trash2 size={14} />
//             </button>
//         </div>
//     );

//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <Loader />
//             </div>
//         );
//     }

//     if (error) {
//         return <div className="p-6 text-red-500">Error loading users</div>;
//     }


//     return (
//         <>
//             <Header title="User Management">
//                 <div className="flex items-center gap-3">
//                     <Export
//                         data={exportData}
//                         selectedRows={[]}
//                         sectionName="users"
//                         fileName="users-export"
//                     />
//                     <OrangeButton
//                         buttonTitle="+ Create"
//                         panelTitle="Create New User"
//                         onRightClick={() => {
//                             document.getElementById('create-user-form')?.dispatchEvent(
//                                 new Event('submit', { cancelable: true, bubbles: true })
//                             );
//                         }}
//                         drawerContent={
//                             <Formik
//                                 initialValues={{
//                                     name: "",
//                                     email: "",
//                                     password: "",
//                                     mobileNo: "",
//                                     adharCard: "",
//                                     role: "",
//                                     department: "",
//                                     position: "",
//                                     isActive: true,
//                                 }}
//                                 validate={(values) => {
//                                     const errors = {};
//                                     if (!values.name) errors.name = "Required";
//                                     if (!values.email) errors.email = "Required";
//                                     if (!values.password) errors.password = "Required";
//                                     if (!values.mobileNo) errors.mobileNo = "Required";
//                                     if (!values.adharCard) errors.adharCard = "Required";
//                                     if (!values.role) errors.role = "Required";
//                                     if (!values.department) errors.department = "Required";
//                                     if (!values.position) errors.position = "Required";
//                                     return errors;
//                                 }}
//                                 onSubmit={async (values) => {
//                                     try {
//                                         await signup(values).unwrap();
//                                         toast.success("User created successfully");
//                                     } catch (error) {
//                                         toast.error(error?.data?.message || "Failed to create user");
//                                     }
//                                 }}
//                             >
//                                 <Form id="create-user-form" className="space-y-4">
//                                     <InputField
//                                         label="Name"
//                                         name="name"
//                                         placeholder="Enter user name"
//                                     />
//                                     <InputField
//                                         type="email"
//                                         label="Email"
//                                         name="email"
//                                         placeholder="Enter email"
//                                     />
//                                     <InputField
//                                         type="password"
//                                         label="Password"
//                                         name="password"
//                                         placeholder="Enter password"
//                                     />
//                                     <InputField
//                                         type="number"
//                                         label="Mobile"
//                                         name="mobileNo"
//                                         placeholder="Enter Mobile number"
//                                     />
//                                     <InputField
//                                         label="Aadhar Card"
//                                         name="adharCard"
//                                         placeholder="Enter Aadhar number"
//                                     />
//                                     <div className="flex gap-3">
//                                         <CustomDropdown
//                                             variant="card"
//                                             label="Role"
//                                             name="role"
//                                             options={[
//                                                 { value: "faculty", label: "Faculty" },
//                                                 { value: "admin", label: "Admin" },
//                                                 { value: "superadmin", label: "Super Admin" },
//                                             ]}
//                                         />
//                                         <CustomDropdown
//                                             variant="card"
//                                             label="Department"
//                                             name="department"
//                                             options={[
//                                                 { value: "ITEG", label: "ITEG" },
//                                                 { value: "MEG", label: "MEG" },
//                                                 { value: "BEG", label: "BEG" },
//                                             ]}
//                                         />
//                                     </div>
//                                     <InputField
//                                         label="Position"
//                                         name="position"
//                                         placeholder="Enter position"
//                                     />
//                                     <RadioGroup
//                                         label="Status"
//                                         name="isActive"
//                                     />
//                                 </Form>
//                             </Formik>
//                         }
//                     />
//                 </div>
//             </Header>

//             <TabsCommon
//                 tabs={tabs}
//                 activeTab={activeTab}
//                 onTabChange={setActiveTab}
//             />
            
//             <div className="p-5">
//          <div className="flex justify-between">
//                 <PageNavbar
//                     title="Active Staff Directory"
//                     showBackButton={false}
//                 />
//                 <div className="py-4 w-full max-w-xl">
//                     <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 </div>
//             </div>

//                 <CommonTable
//                     columns={columns}
//                     data={filteredUsers}
//                     searchTerm={searchTerm}
//                     pagination={true}
//                     editable={true}
//                     actionButton={actionButton}
//                     onRowClick={(user) => handleViewUser(user.id)}
//                     rowsPerPage={10}
//                 />
//             </div>

//             {/* ================= EDIT MODAL ================= */}

//             {editModal.show && (
//                 <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl py-4 px-6 w-full max-w-2xl relative">
//                         <button
//                             onClick={() =>
//                                 setEditModal({ show: false, user: null })
//                             }
//                             className="absolute top-4 right-4"
//                         >
//                             <X size={20} />
//                         </button>

//                         <h2 className="text-2xl font-semibold text-center mb-6">
//                             Edit User
//                         </h2>

//                         <Formik
//                             initialValues={{
//                                 name: editModal.user?.name || "",
//                                 position: editModal.user?.position || "",
//                                 role: editModal.user?.role || "",
//                                 department: editModal.user?.department || "",
//                                 isActive: editModal.user?.isActive ?? true,
//                             }}
//                             onSubmit={async (values) => {
//                                 try {
//                                     await editUser({
//                                         id: editModal.user.id,
//                                         ...values,
//                                     }).unwrap();

//                                     toast.success("User updated successfully");
//                                     setEditModal({ show: false, user: null });
//                                 } catch {
//                                     toast.error("Failed to update user");
//                                 }
//                             }}
//                         >
//                             <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <InputField
//                                     label="Name"
//                                     name="name"
//                                     placeholder="Enter user name"
//                                 />

//                                 <CustomDropdown
//                                     label="Role"
//                                     name="role"
//                                     options={[
//                                         { value: "faculty", label: "Faculty" },
//                                         { value: "admin", label: "Admin" },
//                                         { value: "superadmin", label: "Super Admin" },
//                                     ]}
//                                 />

//                                 <div className="col-span-2 flex gap-3 pt-6">
//                                     <button
//                                         type="submit"
//                                         className={`flex-1 py-3 ${buttonStyles.primary}`}
//                                     >
//                                         Save Changes
//                                     </button>

//                                     <button
//                                         type="button"
//                                         onClick={() =>
//                                             setEditModal({ show: false, user: null })
//                                         }
//                                         className={`flex-1 py-3 ${buttonStyles.secondary}`}
//                                     >
//                                         Cancel
//                                     </button>
//                                 </div>
//                             </Form>
//                         </Formik>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default UsersManagement;