import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { MdBusiness } from "react-icons/md";
import { toast } from "react-toastify";

const PRIMARY_COLOR = "#FDA92D";

const AddDepartmentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    departmentName: "",
    description: "",
    headOfDepartment: "",
    departmentCode: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Department data:", formData);
      
      toast.success("Department added successfully!");
      onSuccess?.(formData);
      handleClose();
    } catch (error) {
      console.error("Error adding department:", error);
      toast.error("Error adding department. Please try again.");
    } finally {
      setIsSubmitting(false);
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
            Add New Department
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Create a new department for your organization
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
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-md transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: PRIMARY_COLOR, 
                color: 'white',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? "Adding..." : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;