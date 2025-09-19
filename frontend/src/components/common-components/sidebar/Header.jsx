// /* eslint-disable no-unused-vars */
import logo from '../../../assets/images/doulLogo.png';
import defaultProfile from '../../../assets/images/profile-img.png';
import UserProfile from '../user-profile/UserProfile';
import { X, Upload } from 'lucide-react';
import { useState } from 'react';
import { useSignupMutation } from '../../../redux/api/authApi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../common-feild/InputField';
import CustomDropdown from '../common-feild/CustomDropdown';
import { buttonStyles } from '../../../styles/buttonStyles';
import BlurBackground from '../BlurBackground';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
        .email('Invalid email')
        .matches(/^[a-zA-Z0-9._%+-]+@ssism\.org$/, 'Email must be from @ssism.org domain')
        .required('Email is required'),
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
    const [selectedImage, setSelectedImage] = useState(null);
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

    const handleImageUpload = (file, setFieldValue) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setFieldValue('profileImage', e.target.result);
            setSelectedImage(file);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (values, { resetForm }) => {
        const facultyData = {
            ...values,
            profileImage: values.profileImage || defaultProfile,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        try {
            await signup(facultyData).unwrap();
            alert('Faculty added successfully!');
            setShowModal(false);
            resetForm();
            setSelectedImage(null);
        } catch (error) {
            console.error('Signup error:', error);
            const errorMessage = error?.data?.message || error?.message || 'Error adding faculty';
            alert(errorMessage);
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-[var(--backgroundColor)] border-b border-gray-300 shadow h-16 md:h-20">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="SSISM Logo" className="h-20 md:h-24" />
                </div>
                <div className="flex items-center gap-4">
                    {userRole === 'superadmin' && (
                        <button
                            onClick={handleAddFaculty}
                            className={`px-4 py-1 text-sm font-medium ${buttonStyles.primary}`}
                            title="Add Member"
                        >
                            <span className="hidden sm:flex sm:items-center sm:gap-2">
                                <span className="text-lg font-bold">+</span>
                                <span>Add</span>
                                <span>User</span>
                            </span>
                        </button>
                    )}
                    <UserProfile />
                </div>
            </header>

            <BlurBackground isOpen={showModal} onClose={() => { setShowModal(false); setSelectedImage(null); }}>
                <div className="bg-white rounded-lg p-6 w-[600px] max-w-2xl mx-4 min-h-[55%] h-auto overflow-visible">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Member</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedImage(null);
                                }}
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
                            {({ setFieldValue }) => (
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
                                        <div className="relative w-full">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        handleImageUpload(file, setFieldValue);
                                                    }
                                                }}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label
                                                htmlFor="image-upload"
                                                className="flex items-center justify-center gap-2 w-full h-12 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <Upload size={16} />
                                                <span className="text-sm">
                                                    {selectedImage ? selectedImage.name : 'Upload Image'}
                                                </span>
                                            </label>
                                            <label className="absolute left-3 -top-2 bg-white px-1 text-xs text-black pointer-events-none">
                                                Profile Image
                                            </label>
                                        </div>
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
                                            className={`w-full py-3 font-medium disabled:opacity-50 ${buttonStyles.primary}`}
                                        >
                                            {isLoading ? 'Adding Member...' : 'Submit'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
            </BlurBackground>
        </>
    );
};

export default Header;
