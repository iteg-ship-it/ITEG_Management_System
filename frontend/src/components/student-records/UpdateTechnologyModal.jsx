/* UpdateTechnologyModal.jsx */
/* eslint-disable react/prop-types */
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUpdateTechnologyMutation } from "../../redux/api/authApi"; // RTK mutation

const UpdateTechnologyModal = ({ isOpen, onClose, studentId }) => {
    const [updateTechnology, { isLoading }] = useUpdateTechnologyMutation();

    const techSchema = Yup.object().shape({
        techno: Yup.string().required("Technology is required"),
    });

    const formik = useFormik({
        initialValues: {
            techno: "",
        },
        validationSchema: techSchema,
        onSubmit: async (values, actions) => {
            try {
                if (!studentId) {
                    alert("Student ID missing!");
                    return;
                }

                await updateTechnology({ id: studentId, techno: values.techno }).unwrap();
                toast.success("Technology updated successfully!");
                actions.resetForm();
                onClose();
            } catch (err) {
                console.error("Error updating technology", err);
                alert(err?.data?.message || "Update failed ❌");
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl py-4 px-6 w-full max-w-lg relative">
                <h2 className="text-xl font-bold text-center text-orange-500 mb-4">Update Technology</h2>
                
                <form onSubmit={formik.handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Technology Field */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                name="techno"
                                value={formik.values.techno}
                                onChange={formik.handleChange}
                                className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                                placeholder=" "
                            />
                            <label className="absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none text-xs -top-2 text-black">
                                Technology
                            </label>
                        </div>
                        {formik.touched.techno && formik.errors.techno && (
                            <p className="text-sm text-red-500">{formik.errors.techno}</p>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex justify-center mt-4 gap-4">
                            <button
                                type="button"
                                onClick={() => {
                                    formik.resetForm();
                                    onClose();
                                }}
                                className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#FDA92D]  text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </form>
                
                <button
                    onClick={() => {
                        formik.resetForm();
                        onClose();
                    }}
                    className="absolute top-3 right-3 text-xl text-gray-400 hover:text-gray-700"
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default UpdateTechnologyModal;
