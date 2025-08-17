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
    refetchOnMountOrArgChange: true, // Always refetch on mount
    refetchOnFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch on network reconnect
    // Force fresh data for interview updates
  });
  
  // Find specific student from the list
  const students = data?.data || [];
  const studentData = students.find(student => student._id === id);
  const interviews = studentData?.PlacementinterviewRecord || [];
  
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [remark, setRemark] = useState("");
  const [result, setResult] = useState("Pending");
  const [newInterviewDate, setNewInterviewDate] = useState("");
  const [newInterviewTime, setNewInterviewTime] = useState("");
  const [showRescheduleDatePicker, setShowRescheduleDatePicker] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [updateInterviewRecord, { isLoading: isUpdating }] = useUpdatePlacedInfoMutation();
  
  const handleUpdateClick = (interview) => {
    setSelectedInterview({ studentId: id, ...interview });
    setRemark(interview.remark || "");
    setResult(interview.status || interview.result || "Pending");
    setIsUpdateModalOpen(true);
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
      const response = await updateInterviewRecord({
        studentId: selectedInterview.studentId,
        interviewId: selectedInterview._id,
        remark,
        status: result, // Send as 'status' instead of 'result'
      }).unwrap();
      
      toast.success("Interview updated successfully");
      setIsUpdateModalOpen(false);
      
      // Force immediate refetch with multiple attempts
      await refetch();
      
      // Additional refetches with delays to ensure backend has processed the update
      setTimeout(async () => {
        await refetch();
      }, 300);
      
      setTimeout(async () => {
        await refetch();
      }, 800);
      
      // Final refetch after 1.5 seconds
      setTimeout(async () => {
        await refetch();
      }, 1500);
      
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err?.data?.message || "Failed to update interview");
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
      case "Reject":
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
                          <button
                            onClick={() => handleRescheduleClick(interview)}
                            className="mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
                          >
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
                          {renderBadge(interview.status || interview.result)}
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
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-72 max-h-96 overflow-y-auto sm:w-80 sm:p-4">
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