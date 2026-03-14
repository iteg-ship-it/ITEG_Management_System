import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Trash2, Edit, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    useGetAllUsersQuery,
    useDeleteUserMutation,
    useEditUserMutation,
    useSignupMutation,
} from "../../redux/api/authApi";

import CommonTable from "./../common-components/table/CommonTable";
import Loader from "./../common-components/loader/Loader";
import InputField from "./../common-components/common-feild/InputField";
import CustomDropdown from "./../common-components/common-feild/CustomDropdown";
import RadioGroup from "./../common-components/common-feild/RadioGroup";
import { Formik, Form } from "formik";
import { buttonStyles } from "./../../styles/buttonStyles";
import profile from "./../../assets/images/profile-img.png";
import Header from "./../common-components/sidebar/Header";
import TabsCommon from "./../common-components/table/TabsCommon";
import PageNavbar from "./../common-components/navbar/PageNavbar";
import SearchBox from "./../common-components/seach-export/SearchBox";
import Export from "./../common-components/seach-export/ExportDropdown";
import OrangeButton from "./../common-components/sidebar/OrangeButton";

const UsersManagement = () => {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All Users");
    const [editModal, setEditModal] = useState({ show: false, user: null });

    const { data: usersData, isLoading: loading, error } =
        useGetAllUsersQuery();

    const [deleteUser] = useDeleteUserMutation();
    const [editUser] = useEditUserMutation();
    const [signup] = useSignupMutation();

    const users = usersData?.users || [];

    const tabs = ["All Users", "Active", "Inactive"];

    /* ===============================
       FILTER + SEARCH LOGIC
    =============================== */

    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (activeTab === "Active") {
            filtered = users.filter((user) => user.isActive);
        } else if (activeTab === "Inactive") {
            filtered = users.filter((user) => !user.isActive);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (user) =>
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.mobileNo?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [users, activeTab, searchTerm]);

    /* ===============================
       EXPORT DATA TRANSFORMATION
    =============================== */

    const exportData = useMemo(() => {
        return filteredUsers.map(user => ({
            Name: user.name || '',
            Email: user.email || '',
            'Contact No': user.mobileNo || '',
            Role: user.role || '',
            Department: user.department || '',
            Position: user.position || '',
            Status: user.isActive ? 'Active' : 'Inactive'
        }));
    }, [filteredUsers]);

    /* ===============================
       HANDLERS
    =============================== */

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
            try {
                await deleteUser(userId).unwrap();
                toast.success("User deleted successfully");
            } catch (error) {
                toast.error("Failed to delete user");
            }
        }
    };

    const handleEditUser = (user) => {
        setEditModal({ show: true, user });
    };

    const handleViewUser = (userId) => {
        navigate(`/user-profile/${userId}`);
    };

    /* ===============================
       ROLE BADGE
    =============================== */

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case "superadmin":
                return "bg-red-100 text-red-800";
            case "admin":
                return "bg-blue-100 text-blue-800";
            case "faculty":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    /* ===============================
       TABLE COLUMNS
    =============================== */

    const columns = [
        {
            key: "name",
            label: "Name",
            render: (user) => (
                <div className="flex items-center">
                    <img
                        className="h-8 w-8 rounded-full object-cover mr-3"
                        src={user.profileImage || profile}
                        alt={user.name}
                    />
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">
                            {user.position}
                        </div>
                    </div>
                </div>
            ),
        },
        { key: "email", label: "Email" },
        { key: "mobileNo", label: "Contact No." },
        {
            key: "role",
            label: "Role",
            render: (user) => (
                <div
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                        user.role
                    )}`}
                >
                    {user.role}
                </div>
            ),
        },
        { key: "department", label: "Department" },
        {
            key: "isActive",
            label: "Status",
            render: (user) => (
                <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                >
                    {user.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
    ];

    const actionButton = (user) => (
        <div className="flex space-x-2">
            <button
                onClick={() => handleEditUser(user)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
                <Edit size={14} />
            </button>

            <button
                onClick={() => handleDeleteUser(user.id, user.name)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return <div className="p-6 text-red-500">Error loading users</div>;
    }


    return (
        <>
            <Header title="User Management">
                <div className="flex items-center gap-3">
                    <Export
                        data={exportData}
                        selectedRows={[]}
                        sectionName="users"
                        fileName="users-export"
                    />
                    <OrangeButton
                        buttonTitle="+ Create"
                        panelTitle="Create New User"
                        onRightClick={() => {
                            document.getElementById('create-user-form')?.dispatchEvent(
                                new Event('submit', { cancelable: true, bubbles: true })
                            );
                        }}
                        drawerContent={
                            <Formik
                                initialValues={{
                                    name: "",
                                    email: "",
                                    password: "",
                                    mobileNo: "",
                                    adharCard: "",
                                    role: "",
                                    department: "",
                                    position: "",
                                    isActive: true,
                                }}
                                validate={(values) => {
                                    const errors = {};
                                    if (!values.name) errors.name = "Required";
                                    if (!values.email) errors.email = "Required";
                                    if (!values.password) errors.password = "Required";
                                    if (!values.mobileNo) errors.mobileNo = "Required";
                                    if (!values.adharCard) errors.adharCard = "Required";
                                    if (!values.role) errors.role = "Required";
                                    if (!values.department) errors.department = "Required";
                                    if (!values.position) errors.position = "Required";
                                    return errors;
                                }}
                                onSubmit={async (values) => {
                                    try {
                                        await signup(values).unwrap();
                                        toast.success("User created successfully");
                                    } catch (error) {
                                        toast.error(error?.data?.message || "Failed to create user");
                                    }
                                }}
                            >
                                <Form id="create-user-form" className="space-y-4">
                                    <InputField
                                        label="Name"
                                        name="name"
                                        placeholder="Enter user name"
                                    />
                                    <InputField
                                        type="email"
                                        label="Email"
                                        name="email"
                                        placeholder="Enter email"
                                    />
                                    <InputField
                                        type="password"
                                        label="Password"
                                        name="password"
                                        placeholder="Enter password"
                                    />
                                    <InputField
                                        type="number"
                                        label="Mobile"
                                        name="mobileNo"
                                        placeholder="Enter Mobile number"
                                    />
                                    <InputField
                                        label="Aadhar Card"
                                        name="adharCard"
                                        placeholder="Enter Aadhar number"
                                    />
                                    <div className="flex gap-3">
                                        <CustomDropdown
                                            variant="card"
                                            label="Role"
                                            name="role"
                                            options={[
                                                { value: "faculty", label: "Faculty" },
                                                { value: "admin", label: "Admin" },
                                                { value: "superadmin", label: "Super Admin" },
                                            ]}
                                        />
                                        <CustomDropdown
                                            variant="card"
                                            label="Department"
                                            name="department"
                                            options={[
                                                { value: "ITEG", label: "ITEG" },
                                                { value: "MEG", label: "MEG" },
                                                { value: "BEG", label: "BEG" },
                                            ]}
                                        />
                                    </div>
                                    <InputField
                                        label="Position"
                                        name="position"
                                        placeholder="Enter position"
                                    />
                                    <RadioGroup
                                        label="Status"
                                        name="isActive"
                                    />
                                </Form>
                            </Formik>
                        }
                    />
                </div>
            </Header>

            <TabsCommon
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            
            <div className="p-5">
         <div className="flex justify-between">
                <PageNavbar
                    title="Active Staff Directory"
                    showBackButton={false}
                />
                <div className="py-4 w-full max-w-xl">
                    <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
            </div>

                <CommonTable
                    columns={columns}
                    data={filteredUsers}
                    searchTerm={searchTerm}
                    pagination={true}
                    editable={true}
                    actionButton={actionButton}
                    onRowClick={(user) => handleViewUser(user.id)}
                    rowsPerPage={10}
                />
            </div>

            {/* ================= EDIT MODAL ================= */}

            {editModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl py-4 px-6 w-full max-w-2xl relative">
                        <button
                            onClick={() =>
                                setEditModal({ show: false, user: null })
                            }
                            className="absolute top-4 right-4"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-semibold text-center mb-6">
                            Edit User
                        </h2>

                        <Formik
                            initialValues={{
                                name: editModal.user?.name || "",
                                position: editModal.user?.position || "",
                                role: editModal.user?.role || "",
                                department: editModal.user?.department || "",
                                isActive: editModal.user?.isActive ?? true,
                            }}
                            onSubmit={async (values) => {
                                try {
                                    await editUser({
                                        id: editModal.user.id,
                                        ...values,
                                    }).unwrap();

                                    toast.success("User updated successfully");
                                    setEditModal({ show: false, user: null });
                                } catch {
                                    toast.error("Failed to update user");
                                }
                            }}
                        >
                            <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Name"
                                    name="name"
                                    placeholder="Enter user name"
                                />

                                <CustomDropdown
                                    label="Role"
                                    name="role"
                                    options={[
                                        { value: "faculty", label: "Faculty" },
                                        { value: "admin", label: "Admin" },
                                        { value: "superadmin", label: "Super Admin" },
                                    ]}
                                />

                                <div className="col-span-2 flex gap-3 pt-6">
                                    <button
                                        type="submit"
                                        className={`flex-1 py-3 ${buttonStyles.primary}`}
                                    >
                                        Save Changes
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditModal({ show: false, user: null })
                                        }
                                        className={`flex-1 py-3 ${buttonStyles.secondary}`}
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