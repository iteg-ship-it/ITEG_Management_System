/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUpdatePermissionMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";

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
      toast.error("Image compression failed." ,err.message);
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Update Permission</h2>

        <label className="block font-medium">Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {permissionData.imageURL && (
          <img
            src={permissionData.imageURL}
            alt="Preview"
            className="mt-2 h-32 border rounded"
          />
        )}

        <label className="block mt-4 font-medium">Remark</label>
        <input
          type="text"
          value={permissionData.remark}
          onChange={(e) =>
            setPermissionData((prev) => ({
              ...prev,
              remark: e.target.value,
            }))
          }
          className="w-full border p-2 rounded"
        />

        <label className="block mt-4 font-medium">Approved By</label>
        <select
          value={permissionData.approved_by}
          onChange={(e) =>
            setPermissionData((prev) => ({
              ...prev,
              approved_by: e.target.value,
            }))
          }
          className="w-full border p-2 rounded"
        >
          <option value="super admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="faculty">Faculty</option>
        </select>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
