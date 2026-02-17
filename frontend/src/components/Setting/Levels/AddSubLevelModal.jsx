import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useAddSubLevelMutation, useUpdateSubLevelMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";

const AddSubLevelModal = ({ isOpen, onClose, onSuccess, departmentId, subdepartmentId, levelId, editData }) => {
  const [formData, setFormData] = useState({
    subLevelName: "",
    description: "",
    status: "Active"
  });

  const [addSubLevel, { isLoading: isAdding }] = useAddSubLevelMutation();
  const [updateSubLevel, { isLoading: isUpdating }] = useUpdateSubLevelMutation();

  useEffect(() => {
    if (editData) {
      setFormData({
        subLevelName: editData.subLevelName || "",
        description: editData.description || "",
        status: editData.status || "Active"
      });
    } else {
      setFormData({ subLevelName: "", description: "", status: "Active" });
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await updateSubLevel({
          departmentId,
          subdepartmentId,
          levelId,
          subLevelId: editData._id,
          ...formData
        }).unwrap();
        toast.success("SubLevel updated successfully!");
      } else {
        await addSubLevel({
          departmentId,
          subdepartmentId,
          levelId,
          ...formData
        }).unwrap();
        toast.success("SubLevel added successfully!");
      }
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving sublevel");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {editData ? "Edit SubLevel" : "Add SubLevel"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SubLevel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subLevelName}
              onChange={(e) => setFormData({ ...formData, subLevelName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1A, 1B"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || isUpdating}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
            >
              {isAdding || isUpdating ? "Saving..." : editData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubLevelModal;
