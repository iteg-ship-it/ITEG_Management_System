import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { MdLayers } from "react-icons/md";
import { toast } from "react-toastify";
<<<<<<< HEAD
=======
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
import { useAddLevelMutation, useUpdateLevelMutation } from "../../../redux/api/authApi";

const PRIMARY_COLOR = "#FDA92D";

const AddLevelModal = ({ isOpen, onClose, onSuccess, departmentId, subdepartmentId, editData }) => {
  const [addLevel, { isLoading: isAdding }] = useAddLevelMutation();
  const [updateLevel, { isLoading: isUpdating }] = useUpdateLevelMutation();
<<<<<<< HEAD
  const [formData, setFormData] = useState({
    levelName: "",
    duration: "",
    status: "Active"
  });
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7

  const isEditMode = !!editData;
  const isLoading = isAdding || isUpdating;

<<<<<<< HEAD
  useEffect(() => {
    if (editData) {
      setFormData({
        levelName: editData.levelName || "",
        duration: editData.duration || "",
        status: editData.status || "Active"
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.levelName.trim()) {
      toast.error("Please enter level name");
      return;
    }
    
=======
  const validationSchema = Yup.object({
    levelName: Yup.string().required("Level name is required"),
    duration: Yup.string(),
    status: Yup.string()
  });

  const initialValues = {
    levelName: editData?.levelName || "",
    duration: editData?.duration || "",
    status: editData?.status || "Active"
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
    try {
      if (isEditMode) {
        await updateLevel({ 
          departmentId, 
          subdepartmentId,
          levelId: editData._id, 
<<<<<<< HEAD
          ...formData 
        }).unwrap();
        toast.success("Level updated successfully!");
      } else {
        await addLevel({ departmentId, subdepartmentId, ...formData }).unwrap();
        toast.success("Level added successfully!");
      }
      handleClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving level");
=======
          ...values 
        }).unwrap();
        toast.success("Level updated successfully!");
      } else {
        await addLevel({ departmentId, subdepartmentId, ...values }).unwrap();
        toast.success("Level added successfully!");
      }
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving level");
    } finally {
      setSubmitting(false);
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
    }
  };

  const handleClose = () => {
<<<<<<< HEAD
    setFormData({ levelName: "", duration: "", status: "Active" });
=======
>>>>>>> 3bc470d053fbcb9087ee7933ac19441ee403e4f7
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
            <MdLayers size={32} style={{ color: PRIMARY_COLOR }} />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: PRIMARY_COLOR }}>
            {isEditMode ? "Edit Level" : "Add Level"}
          </h2>
        </div>

<<<<<<< HEAD
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={formData.levelName}
            onChange={(e) => setFormData(prev => ({ ...prev, levelName: e.target.value }))}
            className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
            placeholder="Level Name *"
            required
          />

          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full"
            placeholder="Duration (e.g., 3 months)"
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
=======
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <InputField 
                label="Level Name" 
                name="levelName" 
                placeholder="Enter level name (e.g., Level 1, Beginner)"
              />

              <InputField 
                label="Duration" 
                name="duration" 
                placeholder="Enter duration (e.g., 3 months, 6 weeks)"
              />

              <InputField 
                label="Status" 
                name="status" 
                type="select"
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" }
                ]}
              />

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
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-md disabled:opacity-50"
                  style={{ backgroundColor: PRIMARY_COLOR, color: 'white' }}
                >
                  {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update" : "Add")}
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

export default AddLevelModal;
