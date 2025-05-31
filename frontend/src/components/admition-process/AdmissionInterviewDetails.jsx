/* eslint-disable react/prop-types */
import { useParams } from "react-router-dom";
import { useGetInterviewDetailByIdQuery } from "../../redux/api/authApi";
import UserProfile from "../common-components/user-profile/UserProfile";

const AdmissionInterviewDetails = () => {
    const { id } = useParams();
    const { data, isLoading, error } = useGetInterviewDetailByIdQuery(id);
    const studentData = JSON.parse(localStorage.getItem('studdedntDetails'))

    if (isLoading) return <p>Loading interview details...</p>;
    if (error) return <p>Error loading interview details.</p>;

    // const student = data?.student;
    const interviews = data?.interviews || [];

    return (
        <>
            <UserProfile showBackButton heading="Interview Detail Page" />
            <div className="p-6 bg-white rounded shadow-md space-y-6">
                {/* Student Basic Info */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
                    <div className="space-y-2 text-sm text-gray-800">
                        <p><strong>Name:</strong> {studentData?.firstName} {studentData?.lastName}</p>
                        <p><strong>Track:</strong> {studentData?.track}</p>
                    </div>
                </div>

                {/* Interview Rounds */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Interview Rounds</h2>
                    {interviews.map((item, index) => (
                        <div
                            key={item._id || index}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-blue-600">
                                    {item.round} Round
                                </h3>
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
