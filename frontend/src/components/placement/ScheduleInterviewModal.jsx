/* ScheduleInterviewModal.jsx */
/* eslint-disable react/prop-types */
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAddPlacementInterviewRecordMutation } from "../../redux/api/authApi"; // ✅ RTK mutation

const ScheduleInterviewModal = ({ isOpen, onClose, studentId }) => {
    const [addInterviewRecord, { isLoading }] = useAddPlacementInterviewRecordMutation();

    const interviewSchema = Yup.object().shape({
        companyName: Yup.string().required("Required"),
        interviewDate: Yup.string().required("Required"),
        // remark: Yup.string().required("Required"),
        // result: Yup.string().required("Required"),
        location: Yup.string().required("Required"),
        jobProfile: Yup.string().required("Required"),
    });

    const formik = useFormik({
        initialValues: {
            companyName: "",
            interviewDate: new Date().toISOString().substring(0, 10),
            remark: "",
            result: "Pending",
            location: "",
            jobProfile: "",
        },
        validationSchema: interviewSchema,
        onSubmit: async (values, actions) => {
            try {
                if (!studentId) {
                    alert("Student ID missing!");
                    return;
                }

                await addInterviewRecord({
                    studentId,
                    interviewData: values,
                }).unwrap();

                alert("Interview added successfully ✅");
                actions.resetForm();
                onClose();
            } catch (err) {
                console.error("Failed to submit interview", err);
                alert(err?.data?.message || "Something went wrong ❌");
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-lg p-8">
                <h2 className="text-2xl font-semibold text-center text-orange-600 mb-6">
                    Add Placement Interview
                </h2>
                <form onSubmit={formik.handleSubmit} className="grid gap-4">
                    <input
                        type="text"
                        name="companyName"
                        placeholder="Company Name"
                        onChange={formik.handleChange}
                        value={formik.values.companyName}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                        type="date"
                        name="interviewDate"
                        onChange={formik.handleChange}
                        value={formik.values.interviewDate}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {/* <input
                        type="text"
                        name="remark"
                        placeholder="Remark"
                        onChange={formik.handleChange}
                        value={formik.values.remark}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <select
                        name="result"
                        onChange={formik.handleChange}
                        value={formik.values.result}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Pending">Pending</option>
                    </select> */}
                    <input
                        type="text"
                        name="location"
                        placeholder="Location"
                        onChange={formik.handleChange}
                        value={formik.values.location}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                        type="text"
                        name="jobProfile"
                        placeholder="Job Profile"
                        onChange={formik.handleChange}
                        value={formik.values.jobProfile}
                        className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />

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
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
                        >
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;
