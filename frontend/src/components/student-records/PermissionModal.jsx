/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useUpdatePermissionMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";

const PermissionModal = ({ isOpen, onClose, studentId }) => {
    const [permissionData, setPermissionData] = useState({
        imageURL: "",
        remark: "",
        approved_by: "admin",
        requested_by: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState("");

    const [updatePermission] = useUpdatePermissionMutation();

    // Get current logged-in user
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userName = user.name || "Unknown User";
        setCurrentUser(userName);
        setPermissionData(prev => ({ ...prev, requested_by: userName }));
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 600,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
            setPermissionData((prev) => ({ ...prev, imageURL: base64 }));
        } catch (err) {
            toast.error("Image compression failed.", err.message);
        }
    };

    const handleSubmit = async () => {
        console.log('Form submission started');
        console.log('Student ID:', studentId);
        console.log('Permission Data:', permissionData);
        
        setIsSubmitting(true);
        
        try {
            if (!permissionData.imageURL) {
                toast.error("Please upload an image");
                return;
            }
            
            if (!studentId) {
                toast.error("Student ID is missing");
                return;
            }
            
            console.log('Calling updatePermission API...');
            const result = await updatePermission({ id: studentId, data: permissionData }).unwrap();
            console.log('API Response:', result);
            
            toast.success("Permission updated successfully");
            onClose();
            // Refresh page to show updated data
            window.location.reload();
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error(error?.data?.message || error?.message || "Failed to update permission");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
                <h2 className="text-xl font-bold text-center text-orange-500 mb-4">Permission Request Form</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current User Field */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={currentUser}
                                readOnly
                                className="peer h-12 w-full border-2 border-gray-300 rounded-md px-3 py-2 leading-tight bg-gray-50 text-gray-700 cursor-not-allowed"
                            />
                            <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                Requested By
                            </label>
                        </div>
                    </div>

                    {/* Approver Role */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="relative w-full">
                            <select
                                value={permissionData.approved_by}
                                onChange={(e) =>
                                    setPermissionData((prev) => ({ ...prev, approved_by: e.target.value }))
                                }
                                className="peer h-12 w-full border-2 border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-black focus:ring-0 transition-all duration-200"
                            >
                                <option value="super admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="faculty">Faculty</option>
                            </select>
                            <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                Approved By <span className="text-red-500">*</span>
                            </label>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="relative w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="peer h-12 w-full border-2 border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-black focus:ring-0 transition-all duration-200"
                            />
                            <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                Upload Signature <span className="text-red-500">*</span>
                            </label>
                        </div>
                        {permissionData.imageURL && (
                            <img
                                src={permissionData.imageURL}
                                alt="Preview"
                                className="mt-3 h-28 object-contain border rounded shadow"
                            />
                        )}
                    </div>

                    {/* Remark Field */}
                    <div className="col-span-2">
                        <div className="relative w-full">
                            <textarea
                                rows={3}
                                value={permissionData.remark}
                                onChange={(e) =>
                                    setPermissionData((prev) => ({ ...prev, remark: e.target.value }))
                                }
                                className="peer h-20 w-full border-2 border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-black focus:ring-0 transition-all duration-200 resize-none"
                                placeholder=" "
                            />
                            <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                Remark / Reason
                            </label>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="col-span-2 flex justify-center mt-4 gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#FDA92D]  text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
                
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default PermissionModal;
