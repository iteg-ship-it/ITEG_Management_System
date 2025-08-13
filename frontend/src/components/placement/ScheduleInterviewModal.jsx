/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAddPlacementInterviewRecordMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useState } from "react";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const ScheduleInterviewModal = ({ isOpen, onClose, studentId, onSuccess }) => {
  const [addInterviewRecord, { isLoading }] = useAddPlacementInterviewRecordMutation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  const interviewSchema = Yup.object().shape({
    companyName: Yup.string().required("Required"),
    hrEmail: Yup.string().email("Invalid email").required("Required"),
    contactNumber: Yup.string().required("Required"),
    positionOffered: Yup.string().required("Required"),
    requiredTechnology: Yup.string().required("Required"),
    interviewDate: Yup.string().required("Required"),
    interviewTime: Yup.string().required("Required"),
    location: Yup.string().required("Required"),
    jobType: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      companyName: "",
      hrEmail: "",
      contactNumber: "",
      positionOffered: "",
      requiredTechnology: "",
      interviewDate: "",
      interviewTime: "",
      location: "",
      jobType: "Internship",
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

        toast.success("Interview added successfully");
        actions.resetForm();
        onClose();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Failed to submit interview", err);
        toast.error(err?.data?.message || "Failed to add interview");
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-lg p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <IoClose size={22} />
        </button>

        {/* Title */}
        <h2
          className="text-2xl font-semibold text-center mb-6"
          style={{ color: PRIMARY_COLOR }}
        >
          Company Interview Details
        </h2>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4 text-[15px]" style={{ color: TEXT_COLOR }}>
          {/* Row 1 */}
          <div className="relative">
            <input
              type="text"
              name="companyName"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.companyName}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Company Name
            </label>
          </div>
          <div className="relative">
            <input
              type="email"
              name="hrEmail"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.hrEmail}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Hr. Email
            </label>
          </div>

          {/* Row 2 */}
          <div className="relative">
            <input
              type="text"
              name="contactNumber"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.contactNumber}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Contact Number
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              name="positionOffered"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.positionOffered}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black">
              Position Offered
            </label>
          </div>

          {/* Job Type */}
          <div className="relative">
            <div className="h-12  px-3 rounded-md flex items-center">
              <div className="flex items-center gap-6">
                {["Internship", "Job"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      value={type}
                      checked={formik.values.jobType === type}
                      onChange={formik.handleChange}
                      className="appearance-none w-5 h-5 border-2 border-black rounded-full focus:outline-none relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:w-2.5 before:h-2.5 before:bg-[#FDA92D] before:rounded-full before:opacity-0 checked:before:opacity-100"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <label className="absolute -top-2 left-2 text-xs bg-white px-1 text-black">
              Job Type
            </label>
          </div>

          {/* Required Technology */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTechDropdown(!showTechDropdown)}
              className={`h-12 border px-3 rounded-md focus:outline-none focus:border-black  w-full text-left flex items-center justify-between peer ${showTechDropdown ? 'border-black' : 'border-gray-300'}`}
            >
              <span className={formik.values.requiredTechnology ? 'text-gray-900' : 'text-transparent'}>
                {formik.values.requiredTechnology || ' '}
              </span>
              <span className="ml-2">▼</span>
            </button>
            <label className={`absolute left-3 transition-all duration-200 ${formik.values.requiredTechnology ? '-top-2 left-2 text-xs bg-white px-1 text-black' : 'top-3 text-gray-500'}`}>
              Required Technology
            </label>
            {showTechDropdown && (
              <div
                className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-50 overflow-hidden"
                style={{
                  background: `
                    linear-gradient(to bottom left, rgba(173, 216, 230, 0.4) 0%, transparent 40%),
                    linear-gradient(to top right, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
                    white
                  `
                }}
              >
                {['Java', 'React', 'Node.js', 'Python'].map((tech) => (
                  <div
                    key={tech}
                    onClick={() => {
                      formik.setFieldValue('requiredTechnology', tech);
                      setShowTechDropdown(false);
                    }}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-left"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interview Date & Time */}
          <div className="relative">
            <input
              type="text"
              name="interviewDate"
              placeholder=" "
              value={`${formik.values.interviewDate}${formik.values.interviewTime ? ` at ${formik.values.interviewTime}` : ''}`}
              onClick={() => setShowDatePicker(!showDatePicker)}
              readOnly
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full cursor-pointer peer"
            />
            <label className={`absolute left-3 transition-all duration-200 ${formik.values.interviewDate ? '-top-2 left-2 text-xs bg-white px-1 text-black' : 'top-3 text-gray-500'}`}>
              Select Date & Time
            </label>
            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#FDA92D]" />
            {showDatePicker && (
              <div className="absolute top-full left-0 mt-2 z-50">
                <DatePickerComponent
                  selectedDate={formik.values.interviewDate}
                  selectedTime={formik.values.interviewTime}
                  onDateTimeSelect={(date, time) => {
                    formik.setFieldValue('interviewDate', date);
                    formik.setFieldValue('interviewTime', time);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <input
              type="text"
              name="location"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.location}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full peer"
            />
            <label className="absolute left-3 top-3 text-gray-500 transition-all duration-200 peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-[#FDA92D] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1">
              Company Location
            </label>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-md text-white hover:opacity-90 transition disabled:opacity-50"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
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



export default ScheduleInterviewModal;