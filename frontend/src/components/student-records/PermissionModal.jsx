/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useUpdatePermissionMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
import { buttonStyles } from "../../styles/buttonStyles";

const PermissionModal = ({ isOpen, onClose, studentId }) => {
    const [permissionData, setPermissionData] = useState({
        imageURL: "",
        remark: "",
        approved_by: "admin",
        requested_by: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState("");
    const [showApproverDropdown, setShowApproverDropdown] = useState(false);

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
                <h2 className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]"
                >Permission Request Form</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current User Field */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="relative w-full">
                            <input
                                type="text"
                                id="requestedBy"
                                value={currentUser}
                                readOnly
                                className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer bg-gray-50 text-gray-700 cursor-not-allowed"
                                placeholder=" "
                            />
                            <label
                                htmlFor="requestedBy"
                                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
                            >
                                Requested By
                            </label>
                        </div>
                    </div>

                    {/* Approver Role */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="relative w-full">
                            <button
                                type="button"
                                onClick={() => setShowApproverDropdown(!showApproverDropdown)}
                                className={`h-12 border px-3 rounded-md focus:outline-none focus:border-black w-full text-left flex items-center justify-between ${showApproverDropdown ? 'border-black' : 'border-gray-300'}`}
                            >
                                <span className={permissionData.approved_by ? 'text-gray-900' : 'text-gray-500'}>
                                    {permissionData.approved_by || 'Select Approver'}
                                </span>
                                <span className="ml-2">▼</span>
                            </button>
                            <label className="absolute left-3 -top-2 text-xs bg-white px-1 text-black pointer-events-none">
                                Approved By <span className="text-red-500">*</span>
                            </label>
                            {showApproverDropdown && (
                                <div
                                    className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-10 overflow-hidden border"
                                    style={{
                                        background: `
                                            linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                                            linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                                            white
                                        `
                                    }}
                                >
                                    {['super admin', 'admin', 'faculty'].map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => {
                                                setPermissionData((prev) => ({ ...prev, approved_by: option }));
                                                setShowApproverDropdown(false);
                                            }}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150 capitalize"
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Signature Upload */}
                    <div className="col-span-2">
                        <div className="relative w-full">
                            <div
                                onClick={() => document.getElementById('uploadSignature').click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const files = e.dataTransfer.files;
                                    if (files.length > 0) {
                                        handleImageUpload({ target: { files } });
                                    }
                                }}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors duration-200 bg-gray-50"
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <div>
                                        <span className="text-blue-600 font-medium">Choose application file</span>
                                        <span className="text-gray-500"> or drag and drop</span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        PDF, DOC, DOCX
                                    </div>
                                </div>
                                {permissionData.imageURL && (
                                    <div className="mt-2 text-green-600 text-sm">
                                        ✓ File uploaded successfully
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="uploadSignature"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <label className="absolute left-3 -top-2 text-xs bg-white px-1 text-black pointer-events-none">
                                Upload Signature <span className="text-red-500">*</span>
                            </label>
                        </div>
                        {permissionData.imageURL && (
                            <div className="mt-3 p-2 border rounded-lg bg-gray-50">
                                <img
                                    src={permissionData.imageURL}
                                    alt="Signature Preview"
                                    className="h-20 w-full object-contain rounded"
                                />
                                <p className="text-xs text-gray-600 text-center mt-1">Signature Preview</p>
                            </div>
                        )}
                    </div>

                    {/* Remark Field */}
                    <div className="col-span-2">
                        <div className="relative w-full">
                            <textarea
                                rows={3}
                                id="remark"
                                value={permissionData.remark}
                                onChange={(e) =>
                                    setPermissionData((prev) => ({ ...prev, remark: e.target.value }))
                                }
                                className="h-20 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:border-black w-full peer resize-none"
                                placeholder=" "
                            />
                            <label
                                htmlFor="remark"
                                className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
                            >
                                Remark / Reason
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-2 mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles.primary}`}
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
