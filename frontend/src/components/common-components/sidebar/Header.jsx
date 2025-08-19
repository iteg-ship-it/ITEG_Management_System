import logo from '../../../assets/images/doulLogo.png';
import UserProfile from '../user-profile/UserProfile';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
    const userRole = localStorage.getItem('role');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: ''
    });

    const handleAddFaculty = () => {
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Faculty data:', formData);
        setShowModal(false);
        setFormData({ name: '', email: '', department: '' });
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
                    <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Add Faculty</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                            
                            <button
                                type="submit"
                                className="w-full py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-darker)] transition-colors font-medium"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
