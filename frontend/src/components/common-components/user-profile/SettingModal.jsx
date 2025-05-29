/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUpdateUserMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import profileImg from "../../../assets/images/profile-img.png";

const SettingsModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
    });

    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await updateUser({
                id: user.id,
                data: { name: formData.name },
            }).unwrap();

            toast.success("Profile updated successfully!");
            localStorage.setItem("user", JSON.stringify(response.user));
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update profile");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-11/12 max-w-md">
                <div className="bg-[#FCD2AA] p-6 flex flex-col items-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-700 text-xl hover:text-black"
                    >
                        ✕
                    </button>
                    <div className="relative">
                        <img
                            src={user?.avatar || profileImg}
                            alt="Profile"
                            className="rounded-full w-20 h-20 object-cover border-2 border-white"
                        />
                        <span className="absolute bottom-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{user?.email}</p>
                    <h2 className="font-bold text-lg mt-1">Edit Profile</h2>
                </div>

                <div className="px-8 py-6 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-3xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
