/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetReadyStudentsForPlacementQuery, useUpdatePlacedInfoMutation } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
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
  const interviews = studentData?.PlacementinterviewRecord || [];
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdateRoundModalOpen, setIsUpdateRoundModalOpen] = useState(false);
  const [isAddNextRoundModalOpen, setIsAddNextRoundModalOpen] = useState(false);
  const [isCompanyHistoryModalOpen, setIsCompanyHistoryModalOpen] = useState(false);
  const [selectedCompanyHistory, setSelectedCompanyHistory] = useState([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [nextRoundData, setNextRoundData] = useState({});
  const [nextRoundDate, setNextRoundDate] = useState("");
  const [nextRoundTime, setNextRoundTime] = useState("");
  const [nextRoundFeedback, setNextRoundFeedback] = useState("");
  const [nextRoundResult, setNextRoundResult] = useState("Pending");
  const [nextRoundMode, setNextRoundMode] = useState("Online");
  const [showNextRoundDatePicker, setShowNextRoundDatePicker] = useState(false);
  const [isNextRoundDropdownOpen, setIsNextRoundDropdownOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [remark, setRemark] = useState("");
  const [result, setResult] = useState("Pending");
  const [round, setRound] = useState("Round 1");
  const [localRounds, setLocalRounds] = useState({});
  const [addedRounds, setAddedRounds] = useState({});
  const [addedRoundDetails, setAddedRoundDetails] = useState({});
  const [newInterviewDate, setNewInterviewDate] = useState("");
  const [newInterviewTime, setNewInterviewTime] = useState("");
  const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [updateInterviewRecord, { isLoading: isUpdating }] = useUpdatePlacedInfoMutation();
  
  // Function to get auto-incremented round for same company
  const getAutoRound = (interview, index) => {
    const companyName = interview.companyName;
    const sameCompanyInterviews = interviews.filter((int, idx) => 
      int.companyName === companyName && idx <= index
    );
    return `Round ${sameCompanyInterviews.length}`;
  };
  
  // Group interviews by company and get latest round info
  const getGroupedInterviews = () => {
    const grouped = {};
    interviews.forEach((interview, index) => {
      const companyName = interview.companyName;
      if (!grouped[companyName]) {
        grouped[companyName] = {
          ...interview,
          originalIndex: index,
          totalRounds: 1,
          currentRound: localRounds[interview._id] || interview.round || getAutoRound(interview, index)
        };
      } else {
        grouped[companyName].totalRounds += 1;
        // Update to latest interview data but keep the first interview's ID for consistency
        const latestRound = localRounds[interview._id] || interview.round || getAutoRound(interview, index);
        if (parseInt(latestRound.replace('Round ', '')) > parseInt(grouped[companyName].currentRound.replace('Round ', ''))) {
          grouped[companyName] = {
            ...grouped[companyName],
            ...interview,
            currentRound: latestRound,
            totalRounds: grouped[companyName].totalRounds
          };
        }
      }
    });
    
    // Add locally added rounds to the count and update current round
    Object.keys(addedRounds).forEach(companyName => {
      if (grouped[companyName]) {
        grouped[companyName].totalRounds += addedRounds[companyName].count;
        grouped[companyName].currentRound = addedRounds[companyName].latestRound;
      }
    });
    
    return Object.values(grouped);
  };
  
  const groupedInterviews = getGroupedInterviews();
  
  const handleCompanyNameClick = (companyName) => {
    // Get original interviews for this company
    const companyInterviews = interviews.filter(interview => interview.companyName === companyName)
      .map((interview, index) => ({
        ...interview,
        displayRound: localRounds[interview._id] || interview.round || `Round ${index + 1}`
      }));
    
    // Add locally added rounds for this company
    const addedRoundsForCompany = addedRoundDetails[companyName] || [];
    const allRounds = [...companyInterviews, ...addedRoundsForCompany];
    
    setSelectedCompanyHistory(allRounds);
    setSelectedCompanyName(companyName);
    setIsCompanyHistoryModalOpen(true);
  };
  
  const handleUpdateClick = (interview) => {
    const interviewIndex = interviews.findIndex(int => int._id === interview._id);
    setSelectedInterview({ studentId: id, ...interview });
    setRemark(interview.remark || "");
    setResult(interview.result || "Pending");
    setRound(localRounds[interview._id] || interview.round || getAutoRound(interview, interviewIndex));
    setIsUpdateModalOpen(true);
  };

  const handleAddNextRoundClick = (interview) => {
    const companyName = interview.companyName;
    const sameCompanyInterviews = interviews.filter(int => int.companyName === companyName);
    const nextRoundNumber = sameCompanyInterviews.length + 1;
    
    setNextRoundData({
      baseInterview: interview,
      nextRoundNumber,
      companyName
    });
    setRound(`Round ${nextRoundNumber}`);
    setNextRoundDate("");
    setNextRoundTime("");
    setNextRoundFeedback("");
    setNextRoundResult("Pending");
    setNextRoundMode("Online");
    setIsAddNextRoundModalOpen(true);
  };
  
  const handleAddNextRoundSubmit = async () => {
    try {
      const companyName = nextRoundData.companyName;
      const newRoundId = `temp_${Date.now()}`;
      
      // Create complete round details for history
      const newRoundDetail = {
        _id: newRoundId,
        ...nextRoundData.baseInterview,
        displayRound: round,
        interviewDate: nextRoundDate && nextRoundTime ? 
          new Date(`${nextRoundDate.split('/').reverse().join('-')} ${nextRoundTime}`).toISOString() : null,
        remark: nextRoundFeedback,
        result: nextRoundResult,
        mode: nextRoundMode,
        isLocallyAdded: true
      };
      
      // Update added rounds count for this company
      setAddedRounds(prev => {
        const currentCount = prev[companyName]?.count || 0;
        return {
          ...prev,
          [companyName]: {
            count: currentCount + 1,
            latestRound: round
          }
        };
      });
      
      // Store complete round details for history display
      setAddedRoundDetails(prev => {
        const existingRounds = prev[companyName] || [];
        return {
          ...prev,
          [companyName]: [...existingRounds, newRoundDetail]
        };
      });
      
      // TODO: Backend integration - create new interview record
      // await createNewInterviewRound({
      //   studentId: id,
      //   companyName: nextRoundData.companyName,
      //   round,
      //   interviewDate: nextRoundDate && nextRoundTime ? `${nextRoundDate} ${nextRoundTime}` : null,
      //   feedback: nextRoundFeedback,
      //   result: nextRoundResult,
      //   mode: nextRoundMode,
      //   ...nextRoundData.baseInterview
      // }).unwrap();
      
      toast.success(`Added ${round} for ${nextRoundData.companyName}`);
      setIsAddNextRoundModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add next round");
    }
  };
  
  const handleRescheduleClick = (interview) => {
    setSelectedInterview({ studentId: id, ...interview });
    if (interview.interviewDate) {
      const date = new Date(interview.interviewDate);
      setNewInterviewDate(date.toLocaleDateString('en-GB'));
      setNewInterviewTime(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    } else {
      setNewInterviewDate("");
      setNewInterviewTime("");
    }
    setIsRescheduleModalOpen(true);
  };
  
  const handleUpdateSubmit = async () => {
    try {
      // Store round locally for immediate UI update
      setLocalRounds(prev => ({
        ...prev,
        [selectedInterview._id]: round
      }));
      
      // TODO: Backend integration - uncomment when ready
      // await updateInterviewRecord({
      //   studentId: selectedInterview.studentId,
      //   interviewId: selectedInterview._id,
      //   remark,
      //   result,
      //   round,
      // }).unwrap();
      
      toast.success("Interview updated successfully");
      setIsUpdateModalOpen(false);
      // await refetch(); // Uncomment when backend is ready
    } catch (err) {
      console.error(err);
      toast.error("Failed to update interview");
    }
  };

  const handleUpdateRoundSubmit = async () => {
    try {
      // Store locally for immediate UI update
      setLocalRounds(prev => ({
        ...prev,
        [selectedInterview._id]: round
      }));
      
      // TODO: Backend integration - uncomment when ready
      // await updateInterviewRecord({
      //   studentId: selectedInterview.studentId,
      //   interviewId: selectedInterview._id,
      //   round,
      // }).unwrap();
      
      toast.success("Round updated successfully");
      setIsUpdateRoundModalOpen(false);
      // await refetch(); // Uncomment when backend is ready
    } catch (err) {
      console.error(err);
      toast.error("Failed to update round");
    }
  };
  
  const handleRescheduleSubmit = async () => {
    try {
      // Combine date and time for backend
      let combinedDateTime = '';
      if (newInterviewDate && newInterviewTime) {
        const dateParts = newInterviewDate.split('/');
        if (dateParts.length === 3) {
          const formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          combinedDateTime = `${formattedDate} ${newInterviewTime}`;
        }
      }
      
      await updateInterviewRecord({
        studentId: selectedInterview.studentId,
        interviewId: selectedInterview._id,
        interviewDate: combinedDateTime || newInterviewDate,
      }).unwrap();
      
      toast.success("Interview rescheduled successfully");
      setIsRescheduleModalOpen(false);
      setShowRescheduleDatePicker(false);
      await refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reschedule interview");
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
            {groupedInterviews.map((interview, index) => (
              <div key={interview._id || interview.id || index} 
                   className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-sm">
                
                {/* Card Header */}
                <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 border-b border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Company Name with Icon */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 leading-tight">{interview.companyName || "Company Name"}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6" />
                              </svg>
                              {interview.positionOffered || interview.jobProfile || "Job Profile"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Technology and Round Info */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          {interview.requiredTechnology || "Java"}
                        </div>
                        
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 group"
                          onClick={() => handleCompanyNameClick(interview.companyName)}
                        >
                          <svg className="w-3 h-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-blue-600 text-xs font-semibold group-hover:text-blue-700">
                            {interview.currentRound}
                          </span>
                          <svg className="w-3 h-3 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Round Number Badge */}
                    <div className="text-center ml-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 font-medium">Interview</div>
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
                          <button
                            onClick={() => handleRescheduleClick(interview)}
                            className="mt-2 inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 group"
                          >
                            <svg className="w-3 h-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Reschedule
                          </button>
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
                    
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddNextRoundClick(interview)}
                      className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-[#FED680] active:bg-[#B66816] transition"
                    >
                      Add Next Round
                    </button>
                    <button
                      onClick={() => handleUpdateClick(interview)}
                      className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-orange-600 transition"
                    >
                      Update Interview
                    </button>
                  </div>
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
              <div className="relative w-full">
                <input
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  placeholder=" "
                  className="peer w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                />
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  round ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Round
                </label>
              </div>

              <div className="relative w-full">
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={3}
                  placeholder=" "
                  className="peer w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                />
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  remark ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Remark
                </label>
              </div>

              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight bg-white text-left focus:outline-none focus:border-[#FDA92D] focus:ring-0 appearance-none flex items-center justify-between cursor-pointer transition-all duration-200"
                >
                  <span className={result ? 'text-gray-900' : 'text-gray-400'}>
                    {result || 'Select'}
                  </span>
                  <span className={`ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  result ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Result
                </label>

                {isDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border"
                    style={{
                      background: `
                        linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 20%),
                        linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 20%),
                        white
                      `
                    }}
                  >
                    {['Pending', 'Selected', 'Rejected'].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setResult(option);
                          setIsDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Company Rounds History Modal */}
      <Dialog open={isCompanyHistoryModalOpen} onClose={() => setIsCompanyHistoryModalOpen(false)} className="fixed z-50 inset-0">
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-semibold text-gray-800">
              {selectedCompanyName} - All Rounds History
            </Dialog.Title>

            <div className="space-y-4">
              {selectedCompanyHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rounds found for this company.</p>
              ) : (
                selectedCompanyHistory.map((round, index) => (
                  <div key={round._id || index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-lg text-gray-800">{round.displayRound}</h5>
                        <p className="text-sm text-gray-600">{round.positionOffered || round.jobProfile || "Position"}</p>
                      </div>
                      <div className="text-right">
                        {renderBadge(round.result)}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Date:</span>
                        <p className="text-gray-800">
                          {round.interviewDate ? new Date(round.interviewDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Location:</span>
                        <p className="text-gray-800">{round.location || "Not specified"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Remarks:</span>
                        <p className="text-gray-800 mt-1">{round.remark || "No remarks provided"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsCompanyHistoryModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Next Round Modal */}
      <Dialog open={isAddNextRoundModalOpen} onClose={() => setIsAddNextRoundModalOpen(false)} className="fixed z-50 inset-0">
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-5">
            <Dialog.Title className="text-xl font-semibold text-gray-800">Add Next Round</Dialog.Title>

            <div className="space-y-4">
              {/* Round Field (Auto-filled) */}
              <div className="relative w-full">
                <input
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  placeholder=" "
                  className="peer w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                />
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  round ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Round
                </label>
              </div>

              {/* Date & Time Field */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Select Date & Time"
                  value={`${nextRoundDate}${nextRoundTime ? ` at ${nextRoundTime}` : ''}`}
                  onClick={() => setShowNextRoundDatePicker(!showNextRoundDatePicker)}
                  readOnly
                  className="peer w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200 cursor-pointer"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FDA92D]" />
                <label className="absolute left-3 bg-white px-1 text-xs -top-2 text-black pointer-events-none">
                  Interview Date & Time
                </label>
                {showNextRoundDatePicker && (
                  <DatePickerComponent
                    selectedDate={nextRoundDate}
                    selectedTime={nextRoundTime}
                    onDateTimeSelect={(date, time) => {
                      setNextRoundDate(date);
                      setNextRoundTime(time);
                      setShowNextRoundDatePicker(false);
                    }}
                    onClose={() => setShowNextRoundDatePicker(false)}
                  />
                )}
              </div>

              {/* Feedback Field */}
              <div className="relative w-full">
                <textarea
                  value={nextRoundFeedback}
                  onChange={(e) => setNextRoundFeedback(e.target.value)}
                  rows={3}
                  placeholder=" "
                  className="peer w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200"
                />
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  nextRoundFeedback ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Feedback
                </label>
              </div>

              {/* Result Dropdown */}
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsNextRoundDropdownOpen(!isNextRoundDropdownOpen)}
                  className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight bg-white text-left focus:outline-none focus:border-[#FDA92D] focus:ring-0 appearance-none flex items-center justify-between cursor-pointer transition-all duration-200"
                >
                  <span className={nextRoundResult ? 'text-gray-900' : 'text-gray-400'}>
                    {nextRoundResult || 'Select'}
                  </span>
                  <span className={`ml-2 transition-transform duration-200 ${isNextRoundDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  nextRoundResult ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Result
                </label>

                {isNextRoundDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border bg-white">
                    {['Pending', 'Selected', 'Rejected'].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setNextRoundResult(option);
                          setIsNextRoundDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mode Dropdown */}
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="peer h-12 w-full border border-gray-300 rounded-md px-3 py-2 leading-tight bg-white text-left focus:outline-none focus:border-[#FDA92D] focus:ring-0 appearance-none flex items-center justify-between cursor-pointer transition-all duration-200"
                >
                  <span className={nextRoundMode ? 'text-gray-900' : 'text-gray-400'}>
                    {nextRoundMode || 'Select'}
                  </span>
                  <span className={`ml-2 transition-transform duration-200 ${isModeDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                
                <label className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  nextRoundMode ? "text-xs -top-2 text-black" : "text-gray-500 top-3"
                }`}>
                  Mode
                </label>

                {isModeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden border bg-white">
                    {['Online', 'Offline', 'Hybrid'].map((option) => (
                      <div
                        key={option}
                        onClick={() => {
                          setNextRoundMode(option);
                          setIsModeDropdownOpen(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left transition-colors duration-150"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsAddNextRoundModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNextRoundSubmit}
                  disabled={isUpdating}
                  className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-[#FED680] active:bg-[#B66816] transition relative"
                >
                  {isUpdating ? "Adding..." : "Add Round"}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} className="fixed z-50 inset-0">
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-5">
            <Dialog.Title className="text-xl font-semibold text-gray-800">Reschedule Interview</Dialog.Title>

            <div className="space-y-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Select Date & Time"
                  value={`${newInterviewDate}${newInterviewTime ? ` at ${newInterviewTime}` : ''}`}
                  onClick={() => setShowRescheduleDatePicker(!showRescheduleDatePicker)}
                  readOnly
                  className="peer w-full border border-gray-300 rounded-md px-3 py-2 leading-tight focus:outline-none focus:border-[#FDA92D] focus:ring-0 transition-all duration-200 cursor-pointer"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FDA92D]" />
                <label className="absolute left-3 bg-white px-1 text-xs -top-2 text-black pointer-events-none">
                  New Interview Date & Time
                </label>
                {showRescheduleDatePicker && (
                  <DatePickerComponent
                    selectedDate={newInterviewDate}
                    selectedTime={newInterviewTime}
                    onDateTimeSelect={(date, time) => {
                      setNewInterviewDate(date);
                      setNewInterviewTime(time);
                      setShowRescheduleDatePicker(false);
                    }}
                    onClose={() => setShowRescheduleDatePicker(false)}
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  disabled={isUpdating || !newInterviewDate || !newInterviewTime}
                  className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-orange-600 transition"
                >
                  {isUpdating ? "Rescheduling..." : "Reschedule"}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

// Custom Date Picker Component with Time Selection
const DatePickerComponent = ({ selectedDate, selectedTime, onDateTimeSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate);
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const hours = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return hour.toString().padStart(2, '0');
  });

  const minutes = ['00', '15', '30', '45'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.toLocaleDateString('en-GB');
  };

  const handleConfirm = () => {
    const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    onDateTimeSelect(tempSelectedDate, timeString);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(day);
      const isSelected = tempSelectedDate === dateStr;
      const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

      days.push(
        <button
          key={day}
          onClick={() => setTempSelectedDate(dateStr)}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${
            isSelected
              ? 'bg-[#FDA92D] text-white'
              : isToday
              ? 'bg-orange-100 text-[#FDA92D]'
              : 'hover:bg-orange-50 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-72 max-h-96 overflow-y-auto sm:w-80 sm:p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <div className="font-semibold text-gray-700">
          {months[currentMonth]} {currentYear}
        </div>
        <button
          onClick={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {renderCalendar()}
      </div>

      {/* Time Selection */}
      {tempSelectedDate && (
        <div className="border-t pt-4">
          <div className="text-center mb-3">
            <h4 className="font-semibold text-gray-700">Select Time</h4>
          </div>
          
          <div className="flex justify-center items-center space-x-2 mb-4">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FDA92D]"
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
            <span className="font-bold text-gray-600">:</span>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FDA92D]"
            >
              {minutes.map(minute => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FDA92D]"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!tempSelectedDate}
          className="px-3 py-1 text-sm bg-[#FDA92D] text-white rounded hover:opacity-90 disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default InterviewHistory;