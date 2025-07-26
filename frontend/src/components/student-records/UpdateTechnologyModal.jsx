/* UpdateTechnologyModal.jsx */
/* eslint-disable react/prop-types */
import { useFormik } from "formik";
import * as Yup from "yup";
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
                alert("Technology updated successfully ✅");
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-indigo-600 mb-6">
                    Update Technology
                </h2>
                <form onSubmit={formik.handleSubmit} className="grid gap-4">
                    <input
                        type="text"
                        name="techno"
                        placeholder="Enter technology (e.g., React, Node.js)"
                        onChange={formik.handleChange}
                        value={formik.values.techno}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    {formik.touched.techno && formik.errors.techno && (
                        <p className="text-sm text-red-500">{formik.errors.techno}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                formik.resetForm();
                                onClose();
                            }}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {isLoading ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateTechnologyModal;
