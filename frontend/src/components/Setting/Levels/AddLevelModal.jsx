import { IoClose } from "react-icons/io5";
import { MdLayers } from "react-icons/md";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import { useAddLevelMutation, useUpdateLevelMutation } from "../../../redux/api/authApi";

const PRIMARY_COLOR = "#FDA92D";

const AddLevelModal = ({ isOpen, onClose, onSuccess, departmentId, subdepartmentId, editData }) => {
  const [addLevel] = useAddLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();

  const isEditMode = !!editData;

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
    if (!departmentId || !subdepartmentId) {
      toast.error("Department and Subdepartment are required");
      return;
    }

    try {
      if (isEditMode) {
        await updateLevel({
          departmentId,
          subdepartmentId,
          levelId: editData._id,
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
    }
  };

  const handleClose = () => {
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
                placeholder="Enter level name"
              />

              <InputField 
                label="Duration" 
                name="duration" 
                placeholder="Enter duration (e.g., 3 months)"
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
      </div>
    </div>
  );
};

export default AddLevelModal;
