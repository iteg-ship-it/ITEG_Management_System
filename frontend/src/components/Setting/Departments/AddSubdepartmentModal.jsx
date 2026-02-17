import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { MdAccountTree } from "react-icons/md";
import { toast } from "react-toastify";
import { useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from "../../../redux/api/authApi";

const PRIMARY_COLOR = "#FDA92D";

const AddSubdepartmentModal = ({ isOpen, onClose, onSuccess, departmentId, editData }) => {
  const [addSubdepartment, { isLoading: isAdding }] = useAddSubdepartmentMutation();
  const [updateSubdepartment, { isLoading: isUpdating }] = useUpdateSubdepartmentMutation();
  const [formData, setFormData] = useState({
    subdepartmentName: "",
    description: "",
    status: "Active"
  });

  const isEditMode = !!editData;
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (editData) {
      setFormData({
        subdepartmentName: editData.subdepartmentName || "",
        description: editData.description || "",
        status: editData.status || "Active"
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subdepartmentName.trim()) {
      toast.error("Please enter subdepartment name");
      return;
    }
    
    try {
      if (isEditMode) {
        await updateSubdepartment({ 
          departmentId, 
          subdepartmentId: editData._id, 
          ...formData 
        }).unwrap();
        toast.success("Subdepartment updated successfully!");
      } else {
        await addSubdepartment({ departmentId, ...formData }).unwrap();
        toast.success("Subdepartment added successfully!");
      }
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving subdepartment");
    }
  };

  const handleClose = () => {
    setFormData({
      subdepartmentName: "",
      description: "",
      status: "Active"
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg p-8 relative m-4">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <IoClose size={22} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: `${PRIMARY_COLOR}20` }}>
            <MdAccountTree size={32} style={{ color: PRIMARY_COLOR }} />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: PRIMARY_COLOR }}>
            {isEditMode ? "Edit Subdepartment" : "Add Subdepartment"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.subdepartmentName}
            onChange={(e) => setFormData(prev => ({ ...prev, subdepartmentName: e.target.value }))}
            className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
            placeholder="Subdepartment Name *"
            required
          />

          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[80px] border border-gray-300 px-3 py-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full resize-none"
            placeholder="Description"
            rows="3"
          />

          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-md disabled:opacity-50"
              style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
            >
              {isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update" : "Add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubdepartmentModal;
