import { MdClose } from "react-icons/md";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import { useAddSubLevelMutation, useUpdateSubLevelMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";

const AddSubLevelModal = ({ isOpen, onClose, onSuccess, departmentId, subdepartmentId, levelId, editData }) => {
  const [addSubLevel] = useAddSubLevelMutation();
  const [updateSubLevel] = useUpdateSubLevelMutation();

  const isEditMode = !!editData;

  const validationSchema = Yup.object({
    subLevelName: Yup.string().required("SubLevel name is required"),
    description: Yup.string(),
    status: Yup.string()
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
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving sublevel");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditMode ? "Edit SubLevel" : "Add SubLevel"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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
            <Form className="space-y-4">
              <InputField 
                label="SubLevel Name" 
                name="subLevelName" 
                placeholder="Enter sublevel name"
              />

              <InputField 
                label="Description" 
                name="description" 
                type="textarea"
                placeholder="Enter description"
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
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update" : "Add")}
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
