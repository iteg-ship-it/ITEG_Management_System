/* eslint-disable react/prop-types */
import { useParams, } from "react-router-dom";
import { useState } from "react";
import { useGetAdmittedStudentsByIdQuery, useGetStudentLevelInterviewsQuery } from "../../redux/api/authApi";
// import { HiArrowNarrowLeft } from "react-icons/hi";
import CreateInterviewModal from "./CreateInterviewModal";
import Loader from "../common-components/loader/Loader";
import PageNavbar from "../common-components/navbar/PageNavbar";

const StudentLevelInterviewHistory = () => {
    const { studentId } = useParams();
    // const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get student basic info
    const { data: studentData } = useGetAdmittedStudentsByIdQuery(studentId);

    // Get level interview history
    const {
        data: levelInterviewData,
        isLoading,
        error,
        refetch
    } = useGetStudentLevelInterviewsQuery(studentId);

    console.log('🎯 Level Interview API Call - studentId:', studentId);
    console.log('📊 Level Interview Data:', levelInterviewData);

    const interviews = levelInterviewData?.level || levelInterviewData || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
                <Loader />
            </div>
        );
    }

    if (error) {
        console.log('Level Interview API Error:', error);
        // If it's a 404 or no data found, show empty state instead of error
        if (error.status === 404 || error.data?.message?.includes('not found')) {
            return (
                <>
                    <PageNavbar
                        title="Level Interview History"
                        subtitle="Student level assessment records and progress tracking"
                        showBackButton={true}
                    />

                    {studentData && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-600">Student Name:</span>
                                    <p className="text-gray-800">{studentData.firstName} {studentData.lastName}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Track:</span>
                                    <p className="text-gray-800">{studentData.track || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600">Current Level:</span>
                                    <p className="text-gray-800">{studentData.currentLevel || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <p className="text-gray-500 text-lg mb-2">No Level Interview History Found</p>
                        <p className="text-gray-400 text-sm">
                            This student hasnO&#768;t taken any level interviews yet.
                        </p>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                            <p className="text-blue-800 text-sm">
                                💡 Level interviews will appear here once the student starts taking level assessments.
                            </p>
                        </div>
                    </div>
                </>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
                <div className="text-center">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 text-lg mb-2">Unable to Load Interview History</p>
                    <p className="text-gray-500 text-sm">Please try again later or contact support.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageNavbar
                title="Level Interview History"
                subtitle="Student level assessment records and progress tracking"
                showBackButton={true}
            />



            {/* Student Info */}
            {studentData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-semibold text-gray-600">Student Name:</span>
                            <p className="text-gray-800">{studentData.firstName} {studentData.lastName}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Track:</span>
                            <p className="text-gray-800">{studentData.track || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">Current Level:</span>
                            <p className="text-gray-800">{studentData.currentLevel || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview History */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Interview Records ({interviews.length})
                </h3>

                {interviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🎓</div>
                        <p className="text-gray-500 text-lg mb-2">No Level Interview Records</p>
                        <p className="text-gray-400 text-sm mb-4">
                            This student hasnO&#768;t taken any level interviews yet.
                        </p>
                        <div className="max-w-md mx-auto">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <p className="text-yellow-800 text-sm">
                                    💡 <strong>What are Level Interviews?</strong><br />
                                    Level interviews are assessments that students take to progress through different academic levels (1A, 1B, 1C, 2A, 2B, 2C).
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800 text-sm">
                                    🚀 Once this student takes level interviews, their progress and results will be displayed here.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    interviews.map((interview, index) => (
                        <InterviewCard
                            key={interview._id || index}
                            interview={interview}
                            index={index}
                        />
                    ))
                )}
            </div>

            {/* Interview Modal */}
            <CreateInterviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                studentId={studentId}
                refetchStudents={refetch}
            />

        </>
    );
};

// Interview Card Component
const InterviewCard = ({ interview }) => {
    const getResultColor = (result) => {
        switch (result?.toLowerCase()) {
            case 'pass': return 'text-green-600 bg-green-100';
            case 'fail': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">{interview.levelNo}</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-medium text-gray-800">
                            Level {interview.levelNo} Interview
                        </h4>
                        <p className="text-sm text-gray-500">
                            Date: {formatDate(interview.date)}
                        </p>
                    </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResultColor(interview.result)}`}>
                    {interview.result || 'Pending'}
                </span>
            </div>

            {/* Marks Grid - Updated for level interview structure */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Theoretical</p>
                    <p className="text-lg font-semibold text-blue-600">
                        {interview.Theoretical_Marks || 0}/10
                    </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Practical</p>
                    <p className="text-lg font-semibold text-green-600">
                        {interview.Practical_Marks || 0}/10
                    </p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Communication</p>
                    <p className="text-lg font-semibold text-purple-600">
                        {interview.Communication_Marks || 0}/10
                    </p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    <p className="text-lg font-semibold text-orange-600">
                        {interview.marks || 0}/30
                    </p>
                </div>
            </div>

            {/* Remark */}
            {interview.remark && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Remark/Feedback:</p>
                    <p className="text-sm text-gray-800">{interview.remark}</p>
                </div>
            )}
        </div>
    );
};

export default StudentLevelInterviewHistory;