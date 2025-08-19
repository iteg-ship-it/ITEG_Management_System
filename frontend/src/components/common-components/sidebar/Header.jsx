import logo from '../../../assets/images/doulLogo.png';
import defaultProfile from '../../../assets/images/profile-img.png';
import UserProfile from '../user-profile/UserProfile';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useSignupMutation } from '../../../redux/api/authApi';

const Header = () => {
    const userRole = localStorage.getItem('role');
    const [showModal, setShowModal] = useState(false);
    const [signup, { isLoading }] = useSignupMutation();
    const [formData, setFormData] = useState({
        name: '',
        profileImage: '',
        email: '',
        password: '',
        mobileNo: '',
        adharCard: '',
        department: '',
        position: '',
        role: 'faculty'
    });

    const handleAddFaculty = () => {
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const facultyData = {
            ...formData,
            profileImage: formData.profileImage || defaultProfile
        };
        
        try {
            await signup(facultyData).unwrap();
            alert('Faculty added successfully!');
            setShowModal(false);
            setFormData({ name: '', profileImage: '', email: '', password: '', mobileNo: '', adharCard: '', department: '', position: '', role: 'faculty' });
        } catch (error) {
            alert(error?.data?.message || 'Error adding faculty');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                            title="Add Faculty"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Add Faculty</span>
                        </button>
                    )}
                    <UserProfile />
                </div>
            </header>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-[500px] max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Faculty</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile No</label>
                                    <input
                                        type="tel"
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Adhar Card</label>
                                <input
                                    type="text"
                                    name="adharCard"
                                    value={formData.adharCard}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                    maxLength="12"
                                    required
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Department</label>
                                    <select
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="ITEG">ITEG</option>
                                        <option value="MEG">MEG</option>
                                        <option value="BEG">BEG</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Position</label>
                                    <select
                                        name="position"
                                        value={formData.position}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                        required
                                    >
                                        <option value="">Select Position</option>
                                        <option value="Assistant Professor">Assistant Professor</option>
                                        <option value="Associate Professor">Associate Professor</option>
                                        <option value="Professor">Professor</option>
                                        <option value="Lecturer">Lecturer</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Profile Image URL</label>
                                <input
                                    type="url"
                                    name="profileImage"
                                    value={formData.profileImage}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary)]"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-darker)] transition-colors font-medium mt-4 disabled:opacity-50"
                            >
                                {isLoading ? 'Adding Faculty...' : 'Submit'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
