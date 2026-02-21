import PropTypes from "prop-types";
import { IoClose } from "react-icons/io5";
import { MdAccountTree } from "react-icons/md";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import InputField from "../../common-components/common-feild/InputField";
import { useAddSubdepartmentMutation, useUpdateSubdepartmentMutation } from "../../../redux/api/authApi";

const PRIMARY_COLOR = "#FDA92D";

const AddSubdepartmentModal = ({ isOpen, onClose, onSuccess, departmentId, editData }) => {
  const [addSubdepartment] = useAddSubdepartmentMutation();
  const [updateSubdepartment] = useUpdateSubdepartmentMutation();

  const isEditMode = !!editData;

  const validationSchema = Yup.object({
    subdepartmentName: Yup.string().required("Subdepartment name is required"),
    description: Yup.string(),
    status: Yup.string()
  });

  const initialValues = {
    subdepartmentName: editData?.subdepartmentName || "",
    description: editData?.description || "",
    status: editData?.status || "Active"
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (isEditMode) {
        await updateSubdepartment({ 
          departmentId, 
          subdepartmentId: editData._id, 
          ...values 
        }).unwrap();
        toast.success("Subdepartment updated successfully!");
      } else {
        await addSubdepartment({ departmentId, ...values }).unwrap();
        toast.success("Subdepartment added successfully!");
      }
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.data?.message || "Error saving subdepartment");
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
            <MdAccountTree size={32} style={{ color: PRIMARY_COLOR }} />
          </div>
          <h2 className="text-2xl font-semibold" style={{ color: PRIMARY_COLOR }}>
            {isEditMode ? "Edit Subdepartment" : "Add Subdepartment"}
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
                label="Subdepartment Name" 
                name="subdepartmentName" 
                placeholder="Enter subdepartment name"
              />

              <InputField 
                label="Description" 
                name="description" 
                type="textarea"
                placeholder="Enter subdepartment description"
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

AddSubdepartmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  departmentId: PropTypes.string.isRequired,
  editData: PropTypes.object
};

export default AddSubdepartmentModal;
