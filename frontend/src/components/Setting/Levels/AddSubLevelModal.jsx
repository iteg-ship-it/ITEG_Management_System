import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import { useAddSubLevelMutation, useUpdateSubLevelMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";

const AddSubLevelModal = ({ isOpen, onClose, onSuccess, departmentId, subdepartmentId, levelId, editData }) => {
  const [addSubLevel, { isLoading: isAdding }] = useAddSubLevelMutation();
  const [updateSubLevel, { isLoading: isUpdating }] = useUpdateSubLevelMutation();

  const validationSchema = Yup.object({
    subLevelName: Yup.string().required("SubLevel name is required"),
    description: Yup.string(),
    status: Yup.string().required("Status is required")
  });

  const initialValues = {
    subLevelName: editData?.subLevelName || "",
    description: editData?.description || "",
    status: editData?.status || "Active"
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editData) {
        await updateSubLevel({
          departmentId,
          subdepartmentId,
          levelId,
          subLevelId: editData._id,
          ...values
        }).unwrap();
        toast.success("SubLevel updated successfully!");
      } else {
        await addSubLevel({
          departmentId,
          subdepartmentId,
          levelId,
          ...values
        }).unwrap();
        toast.success("SubLevel added successfully!");
      }
      resetForm();
      onClose();
      onSuccess();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving sublevel");
    } finally {
      setSubmitting(false);
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="p-6 space-y-4">
              <InputField 
                label="SubLevel Name" 
                name="subLevelName" 
                placeholder="Enter sublevel name (e.g., 1A, 1B)"
              />

              <InputField 
                label="Description" 
                name="description" 
                type="textarea"
                placeholder="Enter sublevel description"
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editData ? "Update" : "Add"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddSubLevelModal;
