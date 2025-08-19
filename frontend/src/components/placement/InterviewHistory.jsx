/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetInterviewHistoryQuery, useGetReadyStudentsForPlacementQuery, useUpdatePlacedInfoMutation, useRescheduleInterviewMutation, useAddInterviewRoundMutation } from "../../redux/api/authApi";
import Loader from "../common-components/loader/Loader";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
import PageNavbar from "../common-components/navbar/PageNavbar";

const InterviewHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get interview history with company data
  const { data: historyData, isLoading: historyLoading, isError: historyError, refetch: refetchHistory } = useGetInterviewHistoryQuery(id, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true, 
    refetchOnReconnect: true,
  });
  
  // Get student data from Ready Students API
  const { data: studentsData, isLoading: studentsLoading, isError: studentsError, refetch: refetchStudents } = useGetReadyStudentsForPlacementQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  // Combine data from both APIs
  const isLoading = historyLoading || studentsLoading;
  const isError = historyError && studentsError;
  const error = historyError || studentsError;
  
  // Get student data from Ready Students API
  const students = studentsData?.data || [];
  const studentData = students.find(student => student._id === id) || {};
  
  // Get interviews with company data from Interview History API
  const interviews = historyData?.data?.interviews || [];
  
  console.log('🔍 History API:', historyData);
  console.log('🔍 Students API:', studentsData);
  console.log('🔍 Student Data:', studentData);
  console.log('🔍 Interviews:', interviews);
  if (interviews.length > 0) {
    console.log('🔍 First Interview:', interviews[0]);
    console.log('🔍 Company Data:', interviews[0]?.company);
  }
  
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
  const [result, setResult] = useState("Scheduled");
  const [round, setRound] = useState("Round 1");
  const [localRounds, setLocalRounds] = useState({});
  const [addedRounds, setAddedRounds] = useState({});
  const [addedRoundDetails, setAddedRoundDetails] = useState({});
  const [newInterviewDate, setNewInterviewDate] = useState("");
  const [newInterviewTime, setNewInterviewTime] = useState("");
  const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [updateInterviewRecord, { isLoading: isUpdating }] = useUpdatePlacedInfoMutation();
  const [rescheduleInterview, { isLoading: isRescheduling }] = useRescheduleInterviewMutation();
  const [addInterviewRound, { isLoading: isAddingRound }] = useAddInterviewRoundMutation();
  
  // Show all interviews as individual cards
  const displayInterviews = interviews || [];
  
  const handleCompanyNameClick = (companyName) => {
    const companyInterviews = interviews.filter(interview => interview.company?.companyName === companyName);
    setSelectedCompanyHistory(companyInterviews);
    setSelectedCompanyName(companyName);
    setIsCompanyHistoryModalOpen(true);
  };
  
  const handleUpdateClick = (interview) => {
    setSelectedInterview({ studentId: id, ...interview });
    setResult(interview.status || "Scheduled");
    setIsUpdateModalOpen(true);
  };

  const handleAddNextRoundClick = (interview) => {
    setNextRoundData({
      baseInterview: interview,
      companyName: interview.companyName
    });
    // Set default round name based on existing rounds count
    const existingRoundsCount = interview.rounds?.length || 0;
    const nextRoundNumber = existingRoundsCount + 1;
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
      // Prepare the data for the API call
      const roundData = {
        roundName: round,
        date: nextRoundDate && nextRoundTime ? 
          new Date(`${nextRoundDate.split('/').reverse().join('-')} ${nextRoundTime}`).toISOString() : new Date().toISOString(),
        mode: nextRoundMode,
        feedback: nextRoundFeedback,
        result: nextRoundResult
      };

      // Call the backend API
      await addInterviewRound({
        studentId: id,
        interviewId: nextRoundData.baseInterview._id,
        ...roundData
      }).unwrap();
      
      toast.success(`Added ${round} for ${nextRoundData.companyName}`);
      setIsAddNextRoundModalOpen(false);
      
      // Refetch both APIs to show the new round
      await Promise.all([
        refetchHistory(),
        refetchStudents()
      ]);
    } catch (err) {
      console.error('Failed to add next round:', err);
      toast.error(err?.data?.message || "Failed to add next round");
    }
  };
  
  const handleRescheduleClick = (interview) => {
    setSelectedInterview({ studentId: id, ...interview });
    const dateToUse = interview.scheduleDate || interview.interviewDate;
    if (dateToUse) {
      const date = new Date(dateToUse);
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
      await updateInterviewRecord({
        studentId: selectedInterview.studentId,
        interviewId: selectedInterview._id,
        status: result,
      }).unwrap();
      
      toast.success("Interview updated successfully");
      setIsUpdateModalOpen(false);
      // Refetch both APIs to get updated data
      await Promise.all([
        refetchHistory(),
        refetchStudents()
      ]);
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err?.data?.message || "Failed to update interview");
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
    if (isRescheduling) return; // Prevent duplicate calls
    
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
      
      await rescheduleInterview({
        studentId: selectedInterview.studentId,
        interviewId: selectedInterview._id,
        newDate: combinedDateTime || newInterviewDate,
      }).unwrap();
      
      toast.success("Interview rescheduled successfully");
      setIsRescheduleModalOpen(false);
      setShowRescheduleDatePicker(false);
      // Refetch both APIs to show updated schedule
      await Promise.all([
        refetchHistory(),
        refetchStudents()
      ]);
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
      case "Passed":
        return <span className={`${base} bg-green-100 text-green-700`}><CheckCircle className="w-4 h-4" />Passed</span>;
      case "Reject":
      case "Rejected":
      case "Failed":
        return <span className={`${base} bg-red-100 text-red-700`}><XCircle className="w-4 h-4" />Failed</span>;
      case "Pending":
        return null; // Don't show pending status
      default:
        return null; // Don't show any badge for unknown status
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
      {studentData && studentData._id && (
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
          <div className="space-y-6">
            {displayInterviews.map((interview, index) => (
              <div key={interview._id || interview.id || index} 
                   className="bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                
                {/* Card Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      {/* Company Name with Icon */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex flex-col gap-3">
                          <h4 className="text-xl font-bold text-gray-900">{interview.company?.companyName || 'Company Name'}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 font-medium">Job Profile:</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-8 0V6a2 2 0 00-2 2v6" />
                              </svg>
                              {interview.jobProfile || interview.positionOffered || interview.position || 'Job Profile'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* View History Button */}
                    <button 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 group ml-6"
                      onClick={() => handleCompanyNameClick(interview.company?.companyName)}
                    >
                      <svg className="w-4 h-4 text-orange-500 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-orange-600 text-sm font-semibold group-hover:text-orange-700">
                        View History
                      </span>
                      <svg className="w-4 h-4 text-orange-500 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 bg-white">
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4V7m6 0v4M6 20h12a2 2 0 002-2V10a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">Interview Date</p>
                          <p className="text-gray-900 font-semibold text-lg mb-3">
                            {(interview.scheduleDate || interview.interviewDate) ? new Date(interview.scheduleDate || interview.interviewDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : "Not specified"}
                          </p>
                          <button
                            onClick={() => handleRescheduleClick(interview)}
                            className="inline-flex items-center gap-2 text-sm bg-orange-50 text-orange-600 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 group"
                          >
                            <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Reschedule
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-1">Location</p>
                          <p className="text-gray-900 font-semibold text-lg">{interview.company?.location || 'Location not specified'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-2">Result Status</p>
                          {interview.status ? (
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                              interview.status === 'Selected' ? 'bg-green-100 text-green-700 border border-green-200' :
                              interview.status === 'RejectedByCompany' || interview.status === 'RejectedByStudent' ? 'bg-red-100 text-red-700 border border-red-200' :
                              interview.status === 'Ongoing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              interview.status === 'Rescheduled' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {interview.status === 'RejectedByCompany' ? 'Rejected by Company' :
                               interview.status === 'RejectedByStudent' ? 'Rejected by Student' :
                               interview.status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium mb-2">Remarks</p>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {(() => {
                                // Get last round feedback if available
                                const lastRoundFeedback = interview.rounds && interview.rounds.length > 0 
                                  ? interview.rounds[interview.rounds.length - 1]?.feedback 
                                  : null;
                                
                                // Show statusRemark first, then last round feedback, or default message
                                return interview.statusRemark || lastRoundFeedback || "No specific remarks provided for this interview.";
                              })()} 
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Interview #{index + 1}
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAddNextRoundClick(interview)}
                      className="inline-flex items-center gap-2 bg-brandYellow text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Round
                    </button>
                    <button
                      onClick={() => handleUpdateClick(interview)}
                      className="inline-flex items-center gap-2 bg-brandYellow text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
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
                  Status
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
                    {['Scheduled', 'Rescheduled', 'Ongoing', 'Selected', 'RejectedByStudent', 'RejectedByCompany'].map((option) => (
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
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50">
          {(() => {
            const totalRounds = selectedCompanyHistory.reduce((total, interview) => {
              return total + (interview.rounds?.length || 0);
            }, 0);
            
            const getModalSize = () => {
              if (totalRounds === 0) return 'max-w-2xl';
              if (totalRounds === 1) return 'max-w-3xl';
              if (totalRounds === 2) return 'max-w-4xl';
              if (totalRounds <= 4) return 'max-w-5xl';
              return 'max-w-6xl';
            };
            
            return (
              <Dialog.Panel className={`bg-white rounded-2xl shadow-2xl ${getModalSize()} w-full max-h-[90vh] overflow-hidden`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-gray-900">
                      {selectedCompanyName}
                    </Dialog.Title>
                    <p className="text-gray-600 text-sm mt-1">Complete Interview History & Rounds</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCompanyHistoryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white hover:bg-opacity-80 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedCompanyHistory.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Interview History</h3>
                  <p className="text-gray-500">No interviews found for this company.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {selectedCompanyHistory.map((interview, interviewIndex) => (
                    <div key={interview._id || interviewIndex} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      


                      {/* Interview Card Body */}
                      <div className="p-6">
                        {/* Rounds Grid - Half and Half Layout */}
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Interview Rounds</h4>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                              {interview.rounds?.length || 0} rounds
                            </span>
                          </div>
                          
                          {interview.rounds && interview.rounds.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {interview.rounds.map((round, roundIndex) => (
                                <div key={roundIndex} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="mb-3">
                                    {/* Round Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between mb-2">
                                        <h5 className="font-medium text-gray-900 truncate">{round.roundName || `Round ${roundIndex + 1}`}</h5>
                                        {renderBadge(round.result)}
                                      </div>
                                      
                                      <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4V7m6 0v4M6 20h12a2 2 0 002-2V10a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                          <span>{round.date ? new Date(round.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          }) : "Date not specified"}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          <span className="px-2 py-1 bg-white text-gray-700 rounded text-xs border">
                                            {round.mode || "Offline"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {round.feedback && (
                                    <div className="mt-3 p-3 bg-white rounded-lg border">
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        <span className="font-medium text-gray-900">Feedback: </span>
                                        {round.feedback}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <h5 className="text-lg font-medium text-gray-900 mb-2">No Rounds Conducted</h5>
                              <p className="text-gray-500 text-sm">This interview session has no rounds recorded yet.</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Interview Remarks */}
                        {(interview.statusRemark || interview.remark) && (
                          <div className="border-t border-gray-200 pt-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                </div>
                                <div>
                                  <h6 className="font-semibold text-blue-900 mb-2">Overall Interview Remarks</h6>
                                  <p className="text-blue-800 text-sm leading-relaxed">{interview.statusRemark || interview.remark}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
              </Dialog.Panel>
            );
          })()}
        </div>
      </Dialog>

      {/* Add Next Round Modal */}
      <Dialog open={isAddNextRoundModalOpen} onClose={() => setIsAddNextRoundModalOpen(false)} className="fixed z-50 inset-0">
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-30">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-5">
            <Dialog.Title className="text-xl font-semibold text-gray-800">Add Round</Dialog.Title>

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
                    {['Pending', 'Passed', 'Failed'].map((option) => (
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
                  disabled={isAddingRound}
                  className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-[#FED680] active:bg-[#B66816] transition relative"
                >
                  {isAddingRound ? "Adding..." : "Add Round"}
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
                  disabled={isRescheduling || !newInterviewDate || !newInterviewTime}
                  className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-orange-600 transition"
                >
                  {isRescheduling ? "Rescheduling..." : "Reschedule"}
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