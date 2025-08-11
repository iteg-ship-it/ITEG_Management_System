/* eslint-disable react/prop-types */
import { useParams, } from "react-router-dom";
import { useState } from "react";
import { useGetAdmittedStudentsByIdQuery } from "../../redux/api/authApi";
import { HiArrowNarrowLeft } from "react-icons/hi";
import CreateInterviewModal from "./CreateInterviewModal";
import Loader from "../common-components/loader/Loader";

const StudentLevelInterviewHistory = () => {
    const { studentId } = useParams();
    // const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        data: studentData,
        isLoading,
        error,
        refetch
    } = useGetAdmittedStudentsByIdQuery(studentId);

    const interviews = studentData?.level || [];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f7fe]">
                <p className="text-center text-red-600">Error loading interview history.</p>
            </div>
        );
    }

    return (
        <>
                <div className="flex items-center gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="text-2xl text-[var(--text-color)] hover:text-gray-900"
                    >
                        <HiArrowNarrowLeft />
                    </button>
                    <h1 className="text-2xl py-4 font-bold">Level Interview History
                    </h1>
                </div>



                {/* Student Info */}
                {/* {studentData && (
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
                )} */}
                   {studentData && (
  <div className="bg-gray-50 rounded-lg p-4 mb-6">
    <div className="flex flex-col md:flex-row text-sm">
      {/* Student Name */}
      <div className="flex flex-col pr-4 mb-4 md:mb-0">
        <span className="font-semibold text-gray-600 text-base">Student Name:</span>
        <span className="text-gray-800 font-medium text-md">
          {studentData.firstName} {studentData.lastName}
        </span>
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block border-l border-dashed border-gray-300 mx-4 h-auto"></div>

      {/* Track */}
      <div className="flex flex-col px-4 mb-4 md:mb-0">
        <span className="font-semibold text-gray-600 text-base">Track:</span>
        <span className="text-gray-800 font-medium text-md">
          {studentData.track || 'N/A'}
        </span>
      </div>

      {/* Vertical Divider */}
      <div className="hidden md:block border-l border-dashed border-gray-300 mx-4 h-auto"></div>

      {/* Current Level */}
      <div className="flex flex-col pl-4">
        <span className="font-semibold text-gray-600 text-base">Current Level:</span>
        <span className="text-gray-800 font-medium text-md">
          {studentData.currentLevel || 'N/A'}
        </span>
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
                            <div className="text-gray-400 text-6xl mb-4">📝</div>
                            <p className="text-gray-500 text-lg">No interview records found</p>
                            <p className="text-gray-400 text-sm mt-2">
                                Click Take Interview to add the first interview record
                            </p>
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