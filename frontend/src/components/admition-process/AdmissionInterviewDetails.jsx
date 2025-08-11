/* eslint-disable react/prop-types */
import { useParams } from "react-router-dom";
import {
    useGetInterviewDetailByIdQuery,
    useInterviewCreateMutation,
} from "../../redux/api/authApi";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextInput from "../common-components/common-feild/TextInput";
import SelectInput from "../common-components/common-feild/SelectInput";
import { toast } from "react-toastify";
import Loader from "../common-components/loader/Loader";
import PageNavbar from "../common-components/navbar/PageNavbar";

const AdmissionInterviewDetails = () => {
    const { id } = useParams();
    const { data, isLoading, error, refetch } = useGetInterviewDetailByIdQuery(id);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createInterview, { isLoading: isSubmitting }] = useInterviewCreateMutation();

    const studentData = JSON.parse(localStorage.getItem("studdedntDetails"));
    const interviews = data?.interviews || [];

    const validationSchema = Yup.object().shape({
        round: Yup.string().required("Required"),
        remark: Yup.string().required("Remark is required"),
        result: Yup.string().required("Result is required"),
    });

    const handleInterviewSubmit = async (values, { resetForm }) => {
        try {
            await createInterview({ ...values, studentId: id }).unwrap();
            toast.success("Interview created successfully");
            setIsModalOpen(false);
            resetForm();
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to create interview");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader />
            </div>
        );
    }
    
    if (error) return <p className="text-center text-red-600">Error loading interview details.</p>;

    return (
        <>
            <PageNavbar 
                title="Student Interview Details" 
                subtitle="View and manage student interview records"
                rightContent={
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2 bg-brandYellow text-white rounded-lg hover:bg-orange-600 transition"
                    >
                        + Add Interview
                    </button>
                }
            />
            <div className="p-6 bg-white rounded-xl shadow-md ">

                <div className="pt-4 space-y-2 text-gray-700 text-sm">
                    <p><strong>Name:</strong> {studentData?.firstName} {studentData?.lastName}</p>
                    <p><strong>Track:</strong> {studentData?.track}</p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">Interview Rounds</h3>
                    {interviews.length === 0 ? (
                        <p className="text-gray-500">No interview records available.</p>
                    ) : (
                        interviews.map((item, index) => (
                            <div
                                key={item._id || index}
                                className="bg-gray-100 border border-gray-300 rounded-xl p-5 shadow-sm space-y-4"
                            >
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium text-blue-600">{item.round} Round</h4>
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
                                    <div className="text-sm text-gray-700">
                                        <span className="font-medium">Remark:</span> {item.remark}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal UI */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-[95%] max-w-xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <h2 className="text-xl font-bold text-center text-orange-500 mb-6">Add Interview</h2>
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
                                <Form className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <SelectInput
                                        label="Round"
                                        name="round"
                                        disabled
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
                                    <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-5 py-2 bg-brandYellow text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit"}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-700"
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
        <span className="text-gray-600 font-semibold">{label}</span>
        <div className="text-gray-900">{value}</div>
    </div>
);

export default AdmissionInterviewDetails;




