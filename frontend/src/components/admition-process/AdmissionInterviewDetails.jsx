/* eslint-disable react/prop-types */
import { useParams } from "react-router-dom";
import {
    useGetInterviewDetailByIdQuery,
    useInterviewCreateMutation,
} from "../../redux/api/authApi";
import UserProfile from "../common-components/user-profile/UserProfile";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInput from "../common-components/common-feild/TextInput";
import SelectInput from "../common-components/common-feild/SelectInput";
import { toast } from "react-toastify";

const AdmissionInterviewDetails = () => {
    const { id } = useParams();
    const { data, isLoading, error, refetch } = useGetInterviewDetailByIdQuery(id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createInterview, { isLoading: isSubmitting }] = useInterviewCreateMutation();

    const studentData = JSON.parse(localStorage.getItem("studdedntDetails"));

    const interviews = data?.interviews || [];

    const validationSchema = Yup.object().shape({
        round: Yup.string().required("Required"),
        remark: Yup.string().required(),
        result: Yup.string().required(),
    });

    const handleInterviewSubmit = async (values, { resetForm }) => {
        try {
            await createInterview({ ...values, studentId: id }).unwrap();
            toast.success("Interview created successfully");
            setIsModalOpen(false);
            resetForm();
            refetch();
        } catch (err) {
            toast.error("Failed to create interview", err?.data?.message);
        }
    };

    if (isLoading) return <p>Loading interview details...</p>;
    if (error) return <p>Error loading interview details.</p>;

    return (
        <>
            <UserProfile showBackButton heading="Interview Detail Page" />
            <div className="p-6 bg-white rounded shadow-md space-y-6">
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                    >
                        + Add Interview
                    </button>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
                    <div className="space-y-2 text-sm text-gray-800">
                        <p>
                            <strong>Name:</strong> {studentData?.firstName} {studentData?.lastName}
                        </p>
                        <p>
                            <strong>Track:</strong> {studentData?.track}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Interview Rounds</h2>
                    {interviews.map((item, index) => (
                        <div
                            key={item._id || index}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-blue-600">{item.round} Round</h3>
                                <span className="text-sm text-gray-500">
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                                <Detail label="Attempt No." value={item.attemptNo} />
                                <Detail label="Communication" value={item.communication} />
                                <Detail label="Confidence" value={item.confidence} />
                                <Detail label="Subject Knowledge" value={item.subjectKnowlage} />
                                <Detail label="Maths" value={item.maths} />
                                <Detail label="Reasoning" value={item.reasoning} />
                                <Detail label="Sincerity" value={item.sincerity} />
                                <Detail label="Goal" value={item.goal} />
                                <Detail label="Marks" value={item.marks} />
                                <Detail label="Result" value={item.result} />
                            </div>
                            {item.remark && (
                                <div className="mt-3">
                                    <span className="block font-medium text-gray-700">Remark:</span>
                                    <p className="text-gray-800 text-sm">{item.remark}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Mini Modal in same file */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[95%] max-w-4xl h-[90vh] overflow-y-auto relative">
                        <h2 className="text-xl font-bold text-orange-500 mb-4 text-center">Add Interview</h2>
                        <Formik
                            initialValues={{
                                round: "Second",
                                remark: "",
                                result: "Pending",
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleInterviewSubmit}
                        >
                            {() => (
                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectInput
                                        label="Round"
                                        name="round"
                                        disabled={true}
                                        options={[{ value: "Second", label: "Final Round" }]}
                                    />

                                    <TextInput label="Remark" name="remark" />
                                    <SelectInput
                                        label="Result"
                                        name="result"
                                        options={[
                                            { value: "Pass", label: "Pass" },
                                            { value: "Fail", label: "Fail" },
                                            { value: "Pending", label: "Pending" },
                                        ]}
                                    />
                                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 border rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-3 text-xl text-gray-500"
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const Detail = ({ label, value }) => (
    <div>
        <span className="text-gray-600 font-medium">{label}</span>
        <div className="text-gray-900">{value}</div>
    </div>
);

export default AdmissionInterviewDetails;


// /* eslint-disable react/prop-types */
// import { useParams } from "react-router-dom";
// import { useGetInterviewDetailByIdQuery } from "../../redux/api/authApi";
// import UserProfile from "../common-components/user-profile/UserProfile";
// import { useState } from "react";
// import { Dialog } from "@headlessui/react";

// const AdmissionInterviewDetails = () => {
//     const { id } = useParams();
//     const { data, isLoading, error } = useGetInterviewDetailByIdQuery(id);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [formData, setFormData] = useState({
//         marks: "",
//         result: "",
//         remark: "",
//     });

//     const studentData = JSON.parse(localStorage.getItem("studdedntDetails"));

//     if (isLoading) return <p>Loading interview details...</p>;
//     if (error) return <p>Error loading interview details.</p>;

//     const interviews = data?.interviews || [];

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log("Submitted Data:", formData, "Student ID:", id);
//         // TODO: Add your API call here to submit the interview data

//         setFormData({ marks: "", result: "", remark: "" });
//         setIsModalOpen(false);
//     };

//     return (
//         <>
//             <UserProfile showBackButton heading="Interview Detail Page" />
//             <div className="p-6 bg-white rounded shadow-md space-y-6">
//                 <div className="flex justify-end">
//                     <button
//                         onClick={() => setIsModalOpen(true)}
//                         className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
//                     >
//                         + Add Interview
//                     </button>
//                 </div>

//                 <div>
//                     <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
//                     <div className="space-y-2 text-sm text-gray-800">
//                         <p>
//                             <strong>Name:</strong> {studentData?.firstName} {studentData?.lastName}
//                         </p>
//                         <p>
//                             <strong>Track:</strong> {studentData?.track}
//                         </p>
//                     </div>
//                 </div>

//                 <div className="space-y-4">
//                     <h2 className="text-xl font-semibold">Interview Rounds</h2>
//                     {interviews.map((item, index) => (
//                         <div
//                             key={item._id || index}
//                             className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
//                         >
//                             <div className="flex justify-between items-center mb-2">
//                                 <h3 className="font-semibold text-blue-600">{item.round} Round</h3>
//                                 <span className="text-sm text-gray-500">
//                                     {new Date(item.date).toLocaleDateString()}
//                                 </span>
//                             </div>
//                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
//                                 <Detail label="Attempt No." value={item.attemptNo} />
//                                 <Detail label="Communication" value={item.communication} />
//                                 <Detail label="Confidence" value={item.confidence} />
//                                 <Detail label="Subject Knowledge" value={item.subjectKnowlage} />
//                                 <Detail label="Maths" value={item.maths} />
//                                 <Detail label="Reasoning" value={item.reasoning} />
//                                 <Detail label="Sincerity" value={item.sincerity} />
//                                 <Detail label="Goal" value={item.goal} />
//                                 <Detail label="Marks" value={item.marks} />
//                                 <Detail label="Result" value={item.result} />
//                             </div>
//                             {item.remark && (
//                                 <div className="mt-3">
//                                     <span className="block font-medium text-gray-700">Remark:</span>
//                                     <p className="text-gray-800 text-sm">{item.remark}</p>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             </div>

//             {/* Modal with 3 fields */}
//             <Dialog
//                 open={isModalOpen}
//                 onClose={() => setIsModalOpen(false)}
//                 className="fixed inset-0 z-50 flex items-center justify-center"
//             >
//                 <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
//                 <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-50 relative">
//                     <Dialog.Title className="text-xl font-bold mb-4">Add Interview Details</Dialog.Title>
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Marks</label>
//                             <input
//                                 type="number"
//                                 name="marks"
//                                 value={formData.marks}
//                                 onChange={handleChange}
//                                 className="w-full mt-1 border rounded px-3 py-2"
//                                 required
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Result</label>
//                             <select
//                                 name="result"
//                                 value={formData.result}
//                                 onChange={handleChange}
//                                 className="w-full mt-1 border rounded px-3 py-2"
//                                 required
//                             >
//                                 <option value="">Select</option>
//                                 <option value="Pass">Pass</option>
//                                 <option value="Fail">Fail</option>
//                                 <option value="Pending">Pending</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700">Remark</label>
//                             <textarea
//                                 name="remark"
//                                 value={formData.remark}
//                                 onChange={handleChange}
//                                 rows="3"
//                                 className="w-full mt-1 border rounded px-3 py-2"
//                             />
//                         </div>
//                         <div className="flex justify-end space-x-2">
//                             <button
//                                 type="button"
//                                 onClick={() => setIsModalOpen(false)}
//                                 className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                             >
//                                 Submit
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </Dialog>
//         </>
//     );
// };

// const Detail = ({ label, value }) => (
//     <div>
//         <span className="text-gray-600 font-medium">{label}</span>
//         <div className="text-gray-900">{value}</div>
//     </div>
// );

// export default AdmissionInterviewDetails;


// // /* eslint-disable react/prop-types */
// // import { useParams } from "react-router-dom";
// // import { useGetInterviewDetailByIdQuery } from "../../redux/api/authApi";
// // import UserProfile from "../common-components/user-profile/UserProfile";
// // import { useState } from "react";
// // import CustomTimeDate from "./CustomTimeDate";

// // const AdmissionInterviewDetails = () => {
// //     const { id } = useParams();
// //     const { data, isLoading, error } = useGetInterviewDetailByIdQuery(id);
// //     const [isModalOpen, setIsModalOpen] = useState(false);
// //     const studentData = JSON.parse(localStorage.getItem('studdedntDetails'));

// //     if (isLoading) return <p>Loading interview details...</p>;
// //     if (error) return <p>Error loading interview details.</p>;

// //     const interviews = data?.interviews || [];

// //     return (
// //         <>
// //             <UserProfile showBackButton heading="Interview Detail Page" />
// //             <div className="p-6 bg-white rounded shadow-md space-y-6">
// //                 <div className="flex justify-end">
// //                     <button
// //                         onClick={() => setIsModalOpen(true)}
// //                         className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
// //                     >
// //                         + Add Interview
// //                     </button>
// //                 </div>

// //                 <div>
// //                     <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
// //                     <div className="space-y-2 text-sm text-gray-800">
// //                         <p><strong>Name:</strong> {studentData?.firstName} {studentData?.lastName}</p>
// //                         <p><strong>Track:</strong> {studentData?.track}</p>
// //                     </div>
// //                 </div>

// //                 <div className="space-y-4">
// //                     <h2 className="text-xl font-semibold">Interview Rounds</h2>
// //                     {interviews.map((item, index) => (
// //                         <div key={item._id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
// //                             <div className="flex justify-between items-center mb-2">
// //                                 <h3 className="font-semibold text-blue-600">{item.round} Round</h3>
// //                                 <span className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
// //                             </div>
// //                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
// //                                 <Detail label="Attempt No." value={item.attemptNo} />
// //                                 <Detail label="Communication" value={item.communication} />
// //                                 <Detail label="Confidence" value={item.confidence} />
// //                                 <Detail label="Subject Knowledge" value={item.subjectKnowlage} />
// //                                 <Detail label="Maths" value={item.maths} />
// //                                 <Detail label="Reasoning" value={item.reasoning} />
// //                                 <Detail label="Sincerity" value={item.sincerity} />
// //                                 <Detail label="Goal" value={item.goal} />
// //                                 <Detail label="Marks" value={item.marks} />
// //                                 <Detail label="Result" value={item.result} />
// //                             </div>
// //                             {item.remark && (
// //                                 <div className="mt-3">
// //                                     <span className="block font-medium text-gray-700">Remark:</span>
// //                                     <p className="text-gray-800 text-sm">{item.remark}</p>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     ))}
// //                 </div>
// //             </div>

// //             {/* Modal for adding interview */}
// //             <CustomTimeDate
// //                 isOpen={isModalOpen}
// //                 onClose={() => setIsModalOpen(false)}
// //                 studentId={id}
// //             />
// //         </>
// //     );
// // };

// // const Detail = ({ label, value }) => (
// //     <div>
// //         <span className="text-gray-600 font-medium">{label}</span>
// //         <div className="text-gray-900">{value}</div>
// //     </div>
// // );

// // export default AdmissionInterviewDetails;
