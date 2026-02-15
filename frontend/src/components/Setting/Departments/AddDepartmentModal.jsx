import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { MdBusiness } from "react-icons/md";
import { toast } from "react-toastify";
import { useAddDepartmentMutation, useUpdateDepartmentMutation } from "../../../redux/api/authApi";

const PRIMARY_COLOR = "#FDA92D";

const AddDepartmentModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [addDepartment, { isLoading: isAdding }] = useAddDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [formData, setFormData] = useState({
    departmentName: "",
    description: "",
    headOfDepartment: "",
    departmentCode: ""
  });

  const isEditMode = !!editData;
  const isLoading = isAdding || isUpdating;

  useEffect(() => {
    if (editData) {
      setFormData({
        departmentName: editData.departmentName || "",
        description: editData.description || "",
        headOfDepartment: editData.headOfDepartment || "",
        departmentCode: editData.departmentCode || ""
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.departmentName.trim()) {
      toast.error("Please enter department name");
      return;
    }

    if (!formData.departmentCode.trim()) {
      toast.error("Please enter department code");
      return;
    }
    
    try {
      if (isEditMode) {
        const result = await updateDepartment({ id: editData._id, ...formData }).unwrap();
        toast.success(result.message || "Department updated successfully!");
      } else {
        const result = await addDepartment(formData).unwrap();
        toast.success(result.message || "Department added successfully!");
      }
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving department:", error);
      const errorMessage = error?.data?.message || error?.message || "Error saving department. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      departmentName: "",
      description: "",
      headOfDepartment: "",
      departmentCode: ""
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-lg p-8 relative m-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <IoClose size={22} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: `${PRIMARY_COLOR}20` }}>
            <MdBusiness size={32} style={{ color: PRIMARY_COLOR }} />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: PRIMARY_COLOR }}>
            {isEditMode ? "Edit Department" : "Add New Department"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {isEditMode ? "Update department information" : "Create a new department for your organization"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              id="departmentName"
              value={formData.departmentName}
              onChange={(e) => handleInputChange('departmentName', e.target.value)}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
              placeholder="Department Name *"
              required
            />
          </div>

          <div className="relative">
            <input
              type="text"
              id="departmentCode"
              value={formData.departmentCode}
              onChange={(e) => handleInputChange('departmentCode', e.target.value.toUpperCase())}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
              placeholder="Department Code *"
              maxLength="10"
              required
            />
          </div>

          <div className="relative">
            <input
              type="text"
              id="headOfDepartment"
              value={formData.headOfDepartment}
              onChange={(e) => handleInputChange('headOfDepartment', e.target.value)}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
              placeholder="Head of Department"
            />
          </div>

          <div className="relative">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[80px] border border-gray-300 px-3 py-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full resize-none"
              placeholder="Description"
              rows="3"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-md transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: PRIMARY_COLOR, 
                color: 'white',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Department" : "Add Department")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;