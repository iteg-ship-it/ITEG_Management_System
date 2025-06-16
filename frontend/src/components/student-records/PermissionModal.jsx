/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUpdatePermissionMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";
import { IoClose } from "react-icons/io5";

const PermissionModal = ({ isOpen, onClose, studentId }) => {
    const [permissionData, setPermissionData] = useState({
        imageURL: "",
        remark: "",
        approved_by: "admin",
    });

    const [updatePermission] = useUpdatePermissionMutation();

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
        try {
            if (!permissionData.imageURL) {
                toast.error("Please upload an image");
                return;
            }
            await updatePermission({ id: studentId, data: permissionData }).unwrap();
            toast.success("Permission updated successfully");
            onClose();
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update permission");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fadeIn relative">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-2xl font-semibold text-gray-800">Update Permission</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 text-2xl"
                    >
                        <IoClose />
                    </button>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Upload Signature
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                    />
                    {permissionData.imageURL && (
                        <img
                            src={permissionData.imageURL}
                            alt="Preview"
                            className="mt-3 h-28 object-contain border rounded shadow"
                        />
                    )}
                </div>

                {/* Remark Field */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                    <textarea
                        rows={3}
                        value={permissionData.remark}
                        onChange={(e) =>
                            setPermissionData((prev) => ({ ...prev, remark: e.target.value }))
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any remark here..."
                    />
                </div>

                {/* Approver Role */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Approved By
                    </label>
                    <select
                        value={permissionData.approved_by}
                        onChange={(e) =>
                            setPermissionData((prev) => ({ ...prev, approved_by: e.target.value }))
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="super admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="faculty">Faculty</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;



// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import { useUpdatePermissionMutation } from "../../redux/api/authApi";
// import { toast } from "react-toastify";
// import imageCompression from "browser-image-compression";

// const PermissionModal = ({ isOpen, onClose, studentId }) => {
//   const [permissionData, setPermissionData] = useState({
//     imageURL: "",
//     remark: "",
//     approved_by: "admin",
//   });

//   const [updatePermission] = useUpdatePermissionMutation();

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const options = {
//       maxSizeMB: 0.3,
//       maxWidthOrHeight: 600,
//       useWebWorker: true,
//     };

//     try {
//       const compressedFile = await imageCompression(file, options);
//       const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
//       setPermissionData((prev) => ({ ...prev, imageURL: base64 }));
//     } catch (err) {
//       toast.error("Image compression failed." ,err.message);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!permissionData.imageURL) {
//         toast.error("Please upload an image");
//         return;
//       }
//       await updatePermission({ id: studentId, data: permissionData }).unwrap();
//       toast.success("Permission updated successfully");
//       onClose();
//     } catch (error) {
//       toast.error(error?.data?.message || "Failed to update permission");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
//       <div className="bg-white p-6 rounded-md w-full max-w-xl shadow-lg">
//         <h2 className="text-xl font-bold mb-4">Update Permission</h2>

//         <label className="block font-medium">Upload Image</label>
//         <input type="file" accept="image/*" onChange={handleImageUpload} />
//         {permissionData.imageURL && (
//           <img
//             src={permissionData.imageURL}
//             alt="Preview"
//             className="mt-2 h-32 border rounded"
//           />
//         )}

//         <label className="block mt-4 font-medium">Remark</label>
//         <input
//           type="text"
//           value={permissionData.remark}
//           onChange={(e) =>
//             setPermissionData((prev) => ({
//               ...prev,
//               remark: e.target.value,
//             }))
//           }
//           className="w-full border p-2 rounded"
//         />

//         <label className="block mt-4 font-medium">Approved By</label>
//         <select
//           value={permissionData.approved_by}
//           onChange={(e) =>
//             setPermissionData((prev) => ({
//               ...prev,
//               approved_by: e.target.value,
//             }))
//           }
//           className="w-full border p-2 rounded"
//         >
//           <option value="super admin">Super Admin</option>
//           <option value="admin">Admin</option>
//           <option value="faculty">Faculty</option>
//         </select>

//         <div className="mt-6 flex justify-end gap-2">
//           <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Update
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PermissionModal;
