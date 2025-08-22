import logo from '../../../assets/images/doulLogo.png';
import defaultProfile from '../../../assets/images/profile-img.png';
import UserProfile from '../user-profile/UserProfile';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useSignupMutation } from '../../../redux/api/authApi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../common-feild/InputField';
import CustomDropdown from '../common-feild/CustomDropdown';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    mobileNo: Yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits').required('Mobile number is required'),
    adharCard: Yup.string().matches(/^[0-9]{12}$/, 'Adhar card must be 12 digits').required('Adhar card is required'),
    department: Yup.string().required('Department is required'),
    position: Yup.string().required('Position is required'),
    role: Yup.string().required('Role is required')
});

const Header = () => {
    const userRole = localStorage.getItem('role');
    const [showModal, setShowModal] = useState(false);
    const [signup, { isLoading }] = useSignupMutation();

    const initialValues = {
        name: '',
        profileImage: '',
        email: '',
        password: '',
        mobileNo: '',
        adharCard: '',
        department: '',
        position: '',
        role: 'faculty'
    };

    const handleAddFaculty = () => {
        setShowModal(true);
    };

    const handleSubmit = async (values, { resetForm }) => {
        const facultyData = {
            ...values,
            profileImage: values.profileImage || defaultProfile
        };

        try {
            await signup(facultyData).unwrap();
            alert('Faculty added successfully!');
            setShowModal(false);
            resetForm();
        } catch (error) {
            alert(error?.data?.message || 'Error adding faculty');
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-[var(--backgroundColor)] border-b border-gray-300 shadow h-16 md:h-20">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="SSISM Logo" className="h-20 md:h-24" />
                </div>
                <div className="flex items-center gap-4">
                    {userRole === 'admin' && (
                        <button
                            onClick={handleAddFaculty}
                            className="flex items-center gap-3 px-5 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-darker)] transition-colors text-sm font-medium"
                            title="Add Member"
                        >
                            <Plus size={20} />
                            <span className="hidden w-max sm:inline">Add Member</span>
                        </button>
                    )}
                    <UserProfile />
                </div>
            </header>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-[600px] max-w-2xl mx-4 min-h-[55%] h-auto overflow-visible">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Member</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {() => (
                                <Form className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="Name" name="name" />
                                        <InputField label="Email" name="email" type="email" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="Password" name="password" type="password" />
                                        <InputField label="Mobile No" name="mobileNo" type="tel" />
                                    </div>

                                    <InputField label="Adhar Card" name="adharCard" />

                                    <div className="grid grid-cols-2 gap-3">
                                        <CustomDropdown
                                            label="Department"
                                            name="department"
                                            options={[
                                                { value: 'ITEG', label: 'ITEG' },
                                                { value: 'MEG', label: 'MEG' },
                                                { value: 'BEG', label: 'BEG' }
                                            ]}
                                        />
                                        <CustomDropdown
                                            label="Position"
                                            name="position"
                                            options={[
                                                { value: 'Assistant Professor', label: 'Assistant Professor' },
                                                { value: 'Associate Professor', label: 'Associate Professor' },
                                                { value: 'Professor', label: 'Professor' },
                                                { value: 'Lecturer', label: 'Lecturer' }
                                            ]}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label="Profile Image URL" name="profileImage" type="url" />
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

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-darker)] transition-colors font-medium disabled:opacity-50"
                                        >
                                            {isLoading ? 'Adding Member...' : 'Submit'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
