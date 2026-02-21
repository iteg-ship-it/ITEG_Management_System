import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { MdBusiness } from "react-icons/md";
import { toast } from "react-toastify";
<<<<<<< HEAD
<<<<<<< HEAD:frontend/src/components/common-components/Setting/AddDepartmentModal.jsx
import { useAddDepartmentMutation } from "../../../redux/api/authApi";
=======
import { useAddDepartmentMutation, useUpdateDepartmentMutation } from "../../../redux/api/authApi";
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/AddDepartmentModal.jsx
=======
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import { useAddDepartmentMutation, useUpdateDepartmentMutation } from "../../../redux/api/authApi";
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

const PRIMARY_COLOR = "#FDA92D";

const AddDepartmentModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [addDepartment, { isLoading: isAdding }] = useAddDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
<<<<<<< HEAD
  const [formData, setFormData] = useState({
    departmentName: "",
    description: "",
    headOfDepartment: "",
    departmentCode: ""
  });
<<<<<<< HEAD:frontend/src/components/common-components/Setting/AddDepartmentModal.jsx
  
  const [addDepartment, { isLoading }] = useAddDepartmentMutation();
=======
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

  const isEditMode = !!editData;
  const isLoading = isAdding || isUpdating;

<<<<<<< HEAD
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
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/AddDepartmentModal.jsx

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
<<<<<<< HEAD:frontend/src/components/common-components/Setting/AddDepartmentModal.jsx
      const result = await addDepartment(formData).unwrap();
      toast.success("Department added successfully!");
      onSuccess?.(result.data);
=======
      if (isEditMode) {
        const result = await updateDepartment({ id: editData._id, ...formData }).unwrap();
        toast.success(result.message || "Department updated successfully!");
      } else {
        const result = await addDepartment(formData).unwrap();
        toast.success(result.message || "Department added successfully!");
      }
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/AddDepartmentModal.jsx
      handleClose();
      onSuccess?.();
    } catch (error) {
<<<<<<< HEAD:frontend/src/components/common-components/Setting/AddDepartmentModal.jsx
      console.error("Error adding department:", error);
      toast.error(error?.data?.message || "Error adding department. Please try again.");
=======
      console.error("Error saving department:", error);
      const errorMessage = error?.data?.message || error?.message || "Error saving department. Please try again.";
      toast.error(errorMessage);
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/AddDepartmentModal.jsx
=======
  const validationSchema = Yup.object({
    departmentName: Yup.string().required("Department name is required"),
    departmentCode: Yup.string().required("Department code is required"),
    headOfDepartment: Yup.string(),
    description: Yup.string(),
    status: Yup.boolean()
  });

  const initialValues = {
    departmentName: editData?.departmentName || "",
    description: editData?.description || "",
    headOfDepartment: editData?.headOfDepartment || "",
    departmentCode: editData?.departmentCode || "",
    status: editData?.status !== undefined ? editData.status : true
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditMode) {
        const result = await updateDepartment({ id: editData._id, ...values }).unwrap();
        toast.success(result.message || "Department updated successfully!");
      } else {
        const result = await addDepartment(values).unwrap();
        toast.success(result.message || "Department added successfully!");
      }
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || "Error saving department. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
    }
  };

  const handleClose = () => {
<<<<<<< HEAD
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

=======
    onClose();
  };

>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
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

<<<<<<< HEAD
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
<<<<<<< HEAD:frontend/src/components/common-components/Setting/AddDepartmentModal.jsx
              {isLoading ? "Adding..." : "Add Department"}
=======
              {isLoading ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Department" : "Add Department")}
>>>>>>> b051ea7966eb15b2629550aa3f4c0f448678e164:frontend/src/components/Setting/Departments/AddDepartmentModal.jsx
            </button>
          </div>
        </form>
=======
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="space-y-4">
              <InputField 
                label="Department Name" 
                name="departmentName" 
                placeholder="Enter department name"
              />

              <InputField 
                label="Department Code" 
                name="departmentCode" 
                placeholder="Enter department code (e.g., CS, IT)"
              />

              <InputField 
                label="Head of Department" 
                name="headOfDepartment" 
                placeholder="Enter HOD name"
              />

              <InputField 
                label="Description" 
                name="description" 
                type="textarea"
                placeholder="Enter department description"
              />

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={values.status === true}
                    onChange={() => setFieldValue('status', true)}
                    className="w-4 h-4 text-[#FDA92D] focus:ring-[#FDA92D]"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={values.status === false}
                    onChange={() => setFieldValue('status', false)}
                    className="w-4 h-4 text-[#FDA92D] focus:ring-[#FDA92D]"
                  />
                  <span className="text-sm text-gray-700">Inactive</span>
                </label>
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
                  {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Department" : "Add Department")}
                </button>
              </div>
            </Form>
          )}
        </Formik>
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
      </div>
    </div>
  );
};

export default AddDepartmentModal;