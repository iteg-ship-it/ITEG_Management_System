/* eslint-disable react/prop-types */
import logo from '../../../assets/images/doulLogo.png';

const Header = ({ sidebarOpen = true, heading, buttons, searchBox }) => {
    return (
<<<<<<< HEAD
        <header 
            className={`fixed top-0 z-40 flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 bg-[var(--backgroundColor)] border-b border-gray-300 shadow h-14 sm:h-16 md:h-20 transition-all duration-300`}
            style={{ left: sidebarOpen ? '256px' : '48px', right: 0 }}
        >
            <div className="flex items-center gap-2 sm:gap-4">
                <img src={logo} alt="SSISM Logo" className="h-12 sm:h-16 md:h-20 lg:h-24" />
                {heading && (
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
                        {heading}
                    </h1>
                )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                {searchBox}
                {buttons}
            </div>
        </header>
=======
        <>
            <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 bg-[var(--backgroundColor)] border-b border-gray-300 shadow h-14 sm:h-16 md:h-20">
                <div className="flex items-center gap-2 sm:gap-4">
                    <img src={logo} alt="SSISM Logo" className="h-12 sm:h-16 md:h-20 lg:h-24" />
                </div>
                <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                    {userRole === 'superadmin' && (
                        <>
                            <button
                                onClick={handleAddFaculty}
                                className={`flex items-center justify-center h-8 sm:h-9 md:h-10 px-2 sm:px-2 md:px-4 text-xs sm:text-sm font-medium ${buttonStyles.primary}`}
                                title="Add Member"
                            >
                                <span className="w-20 hidden sm:inline">Add User</span>
                                <span className="sm:hidden text-lg">+</span>
                            </button>
                        </>
                    )}
                    <UserProfile />
                </div>
            </header>

            <BlurBackground isOpen={showModal} onClose={() => { setShowModal(false); setSelectedImage(null); }}>
                <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-[600px] max-w-2xl mx-2 sm:mx-4 min-h-[55%] h-auto overflow-visible max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl font-semibold">Add Member</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedImage(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <X size={18} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ setFieldValue }) => (
                                <Form className="space-y-3" autoComplete="off">
                                    {/* Hidden dummy fields to prevent autofill */}
                                    <input type="email" style={{display: 'none'}} />
                                    <input type="password" style={{display: 'none'}} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <InputField label="Name" name="name" autoComplete="off" />
                                        <InputField label="Email" name="email" type="email" autoComplete="nope" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <InputField label="Password" name="password" type="password" autoComplete="new-password" />
                                        <InputField label="Mobile No" name="mobileNo" type="tel" />
                                    </div>

                                    <InputField label="Adhar Card" name="adharCard" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                                <span className="text-xs sm:text-sm truncate">
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

                                    <div className="pt-4 sm:pt-6">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full py-2 sm:py-3 text-sm sm:text-base font-medium disabled:opacity-50 ${buttonStyles.primary}`}
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
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
    );
};

export default Header;
