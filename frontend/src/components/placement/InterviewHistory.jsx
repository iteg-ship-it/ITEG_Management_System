import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetReadyStudentsForPlacementQuery, useUpdatePlacedInfoMutation } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import PageNavbar from "../common-components/navbar/PageNavbar";

const InterviewHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading, isError, error, refetch } = useGetReadyStudentsForPlacementQuery(undefined, {
    refetchOnMountOrArgChange: 30,
    refetchOnFocus: false,
    // Remove aggressive polling
  });
  
  // Find specific student from the list
  const students = data?.data || [];
  const studentData = students.find(student => student._id === id);
  const interviews = studentData?.interviewRecord || [];
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [remark, setRemark] = useState("");
  const [result, setResult] = useState("Pending");
  
  const [updateInterviewRecord, { isLoading: isUpdating }] = useUpdatePlacedInfoMutation();
  
  const handleUpdateClick = (interview) => {
    setSelectedInterview({ studentId: id, ...interview });
    setRemark(interview.remark || "");
    setResult(interview.result || "Pending");
    setIsUpdateModalOpen(true);
  };
  
  const handleUpdateSubmit = async () => {
    try {
      await updateInterviewRecord({
        studentId: selectedInterview.studentId,
        interviewId: selectedInterview._id,
        remark,
        result,
      }).unwrap();
      
      toast.success("Interview updated successfully");
      setIsUpdateModalOpen(false);
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update interview");
    }
  };
  
  const renderBadge = (status) => {
    const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "Selected":
        return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle className="w-4 h-4" />Selected</span>;
      case "Rejected":
        return <span className={`${base} bg-red-100 text-red-700`}><XCircle className="w-4 h-4" />Rejected</span>;
      default:
        return <span className={`${base} bg-yellow-100 text-yellow-700`}><Clock className="w-4 h-4" />Pending</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 font-semibold py-6">
        Error loading interview history: {error?.data?.message || "Something went wrong!"}
      </div>
    );
  }

  return (
    <>
      <PageNavbar 
        title="Interview History" 
        subtitle="View and manage student interview records"
        onBack={() => {
          // Get the active tab from localStorage or default to 'Ongoing Interviews'
          const activeTab = localStorage.getItem('placementActiveTab') || 'Ongoing Interviews';
          localStorage.setItem('placementActiveTab', activeTab);
          navigate('/readiness-status');
        }}
      />

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
              <span className="font-semibold text-gray-600">Technology:</span>
              <p className="text-gray-800">{studentData.techno || 'N/A'}</p>
            </div>
          </div>
        </div>
      )} */}
      {studentData && (
  <div className="bg-gray-50 rounded-lg p-4 mb-6">
    <div className="flex justify-between items-center">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-gray-300 text-sm flex-1">
        <div className="pr-4">
          <span className="font-semibold text-gray-600">Student Name:</span>
          <p className="text-gray-800">{studentData.firstName} {studentData.lastName}</p>
        </div>
        <div className="px-4">
          <span className="font-semibold text-gray-600">Track:</span>
          <p className="text-gray-800">{studentData.track || 'N/A'}</p>
        </div>
        <div className="pl-4">
          <span className="font-semibold text-gray-600">Technology:</span>
          <p className="text-gray-800">{studentData.techno || 'N/A'}</p>
        </div>
      </div>
      <button
        onClick={() => navigate(`/student-profile/${studentData._id}`)}
        className="ml-4 bg-brandYellow text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition"
      >
        View Profile
      </button>
    </div>
  </div>
)}

      {/* Interview History Cards */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Interview Records</h3>
        
        {interviews.length === 0 ? (
          <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No Interview Records</h4>
            <p className="text-gray-500">This student has attended any interviews yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((interview, index) => (
              <div key={interview._id || interview.id || index} 
                   className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-sm">
                
                {/* Card Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-5">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-800">
                      <h4 className="text-xl font-bold text-gray-900">{interview.companyName || "Company Name"}</h4>
                      <p className="text-gray-600 text-sm font-medium">{interview.positionOffered || interview.jobProfile || "Job Profile"}</p>
                      <p className="text-gray-500 text-xs font-medium mt-1">
                        Technology: <span className="text-gray-700 font-semibold">({interview.requiredTechnology || "Java"})</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-[#FDA92D]  text-white hover:bg-orange-600 transition rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 font-medium">Interview</div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 bg-white">
                  <div className="grid md:grid-cols-2 gap-6 md:divide-x md:divide-gray-200">
                    
                    {/* Left Column */}
                    <div className="space-y-4 md:pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-lg">📅</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Interview Date</p>
                          <p className="text-gray-800 font-semibold">
                            {interview.interviewDate ? new Date(interview.interviewDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">📍</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Location</p>
                          <p className="text-gray-800 font-semibold">{interview.location || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 md:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-lg">🎯</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Result Status</p>
                          {renderBadge(interview.result)}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 text-lg">💬</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">Remarks</p>
                          <div className="bg-gray-50 rounded-lg p-3 border">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {interview.remark || "No specific remarks provided for this interview."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span>Interview #{index + 1}</span>
                  </div>
                  <button
                    onClick={() => handleUpdateClick(interview)}
                    className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-orange-600 transition"
                  >
                    Update Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      <Dialog open={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} className="fixed z-50 inset-0">
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-5">
            <Dialog.Title className="text-xl font-semibold text-gray-800">Update Interview</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Remark</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-brandYellow"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Result</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-brandYellow"
                >
                  <option value="Pending">Pending</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  disabled={isUpdating}
                  className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-[#FED680] active:bg-[#B66816] transition relative"
                >
                  {isUpdating ? "Submitting..." : "Save"}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default InterviewHistory;