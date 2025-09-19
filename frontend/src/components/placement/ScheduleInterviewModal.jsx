/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import { useFormik } from "formik";
import * as Yup from "yup";
import { useAddPlacementInterviewRecordMutation } from "../../redux/api/authApi";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import { buttonStyles } from "../../styles/buttonStyles";
import BlurBackground from "../common-components/BlurBackground";

const PRIMARY_COLOR = "#FDA92D";
const TEXT_COLOR = "#4B4B4B";

const ScheduleInterviewModal = ({ isOpen, onClose, studentId, onSuccess }) => {
  const [addInterviewRecord, { isLoading }] = useAddPlacementInterviewRecordMutation();
  const [showDatePicker, setShowDatePicker] = useState(false);


  const interviewSchema = Yup.object().shape({
    companyName: Yup.string().required("Required"),
    hrEmail: Yup.string().email("Invalid email").required("Required"),
    hrContact: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be exactly 10 digits")
      .required("Required"),
    location: Yup.string().required("Required"),
    jobProfile: Yup.string().required("Required"),
    scheduleDate: Yup.string().required("Required"),
  });

  const formik = useFormik({
    initialValues: {
      companyName: "",
      hrEmail: "",
      hrContact: "",
      location: "",
      jobProfile: "",
      scheduleDate: "",
    },
    validationSchema: interviewSchema,
    onSubmit: async (values, actions) => {
      try {
        if (!studentId) {
          alert("Student ID missing!");
          return;
        }

        // Convert date format for backend
        let scheduleDate = values.scheduleDate;
        if (scheduleDate && scheduleDate.includes('at')) {
          // Parse "DD/MM/YYYY at HH:MM AM/PM" format
          const [datePart, timePart] = scheduleDate.split(' at ');
          const [day, month, year] = datePart.split('/');
          const [time, period] = timePart.split(' ');
          const [hour, minute] = time.split(':');

          let hour24 = parseInt(hour);
          if (period === 'PM' && hour24 !== 12) hour24 += 12;
          if (period === 'AM' && hour24 === 12) hour24 = 0;

          const isoDate = new Date(year, month - 1, day, hour24, minute);
          scheduleDate = isoDate.toISOString();
        }

        // Create interview data according to API requirements
        const interviewData = {
          companyName: values.companyName,
          hrEmail: values.hrEmail,
          hrContact: values.hrContact,
          location: values.location,
          jobProfile: values.jobProfile,
          scheduleDate: scheduleDate
        };

        console.log('Sending interview data:', interviewData);

        // Call the placement controller createInterview endpoint
        await addInterviewRecord({
          studentId,
          interviewData,
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
      setShowDatePicker(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <BlurBackground isOpen={isOpen} onClose={onClose}>
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
          className="text-2xl font-semibold text-center mb-6 text-[var(--primary)]"
        >
          Company Interview Details
        </h2>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4 text-[15px]" style={{ color: TEXT_COLOR }}>
          {/* Company Name */}
          <div className="relative">
            <input
              type="text"
              id="companyName"
              name="companyName"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.companyName}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
            />
            <label
              htmlFor="companyName"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              Company Name
            </label>
          </div>

          {/* HR Email */}
          <div className="relative">
            <input
              type="email"
              id="hrEmail"
              name="hrEmail"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.hrEmail}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
            />
            <label
              htmlFor="hrEmail"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              HR Email
            </label>
          </div>

          {/* HR Contact */}
          <div className="relative">
            <input
              type="tel"
              id="hrContact"
              name="hrContact"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.hrContact}
              maxLength={10}
              pattern="[0-9]{10}"
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
            />
            <label
              htmlFor="hrContact"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              HR Contact
            </label>
            {formik.touched.hrContact && formik.errors.hrContact && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.hrContact}</div>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <input
              type="text"
              id="location"
              name="location"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.location}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
            />
            <label
              htmlFor="location"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              Location
            </label>
          </div>

          {/* Job Profile */}
          <div className="relative">
            <input
              type="text"
              id="jobProfile"
              name="jobProfile"
              placeholder=" "
              onChange={formik.handleChange}
              value={formik.values.jobProfile}
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full peer"
            />
            <label
              htmlFor="jobProfile"
              className="absolute left-3 top-3 text-gray-500 transition-all duration-200 cursor-text peer-focus:-top-2 peer-focus:left-2 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-black"
            >
              Job Profile
            </label>
          </div>

          {/* Schedule Date */}
          <div className="relative">
            <input
              type="text"
              name="scheduleDate"
              placeholder="Select Date & Time"
              value={formik.values.scheduleDate}
              onClick={() => setShowDatePicker(!showDatePicker)}
              readOnly
              className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-black w-full cursor-pointer"
            />
            <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700" />
            {showDatePicker && (
              <DatePickerComponent
                selectedDate={formik.values.scheduleDate}
                onDateTimeSelect={(dateTime) => {
                  formik.setFieldValue('scheduleDate', dateTime);
                  setShowDatePicker(false);
                }}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-2 mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-md disabled:opacity-50 ${buttonStyles.primary}`}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </BlurBackground>
  );
};

const DatePickerComponent = ({ selectedDate, onDateTimeSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tempSelectedDate, setTempSelectedDate] = useState('');
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
    if (tempSelectedDate) {
      const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      const dateTimeString = `${tempSelectedDate} at ${timeString}`;
      onDateTimeSelect(dateTimeString);
    }
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
          className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${isSelected
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
      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={!tempSelectedDate}
          className="w-full px-3 py-2 text-sm bg-[#FDA92D] text-white rounded hover:opacity-90 disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ScheduleInterviewModal;



// /* eslint-disable react/prop-types */
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useAddPlacementInterviewRecordMutation } from "../../redux/api/authApi";
// import { toast } from "react-toastify";
// import { IoClose } from "react-icons/io5";
// import { FaCalendarAlt } from "react-icons/fa";
// import { useState } from "react";

// const PRIMARY_COLOR = "#FDA92D";
// const TEXT_COLOR = "#4B4B4B";

// const ScheduleInterviewModal = ({ isOpen, onClose, studentId, onSuccess }) => {
//   const [addInterviewRecord, { isLoading }] = useAddPlacementInterviewRecordMutation();
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const interviewSchema = Yup.object().shape({
//     companyName: Yup.string().required("Required"),
//     hrEmail: Yup.string().email("Invalid email").required("Required"),
//     contactNumber: Yup.string().required("Required"),
//     positionOffered: Yup.string().required("Required"),
//     requiredTechnology: Yup.string().required("Required"),
//     interviewDate: Yup.string().required("Required"),
//     interviewTime: Yup.string().required("Required"),
//     location: Yup.string().required("Required"),
//     jobType: Yup.string().required("Required"),
//   });

//   const formik = useFormik({
//     initialValues: {
//       companyName: "",
//       hrEmail: "",
//       contactNumber: "",
//       positionOffered: "",
//       requiredTechnology: "",
//       interviewDate: "",
//       interviewTime: "",
//       location: "",
//       jobType: "Internship",
//     },
//     validationSchema: interviewSchema,
//     onSubmit: async (values, actions) => {
//       try {
//         if (!studentId) {
//           alert("Student ID missing!");
//           return;
//         }

//         await addInterviewRecord({
//           studentId,
//           interviewData: values,
//         }).unwrap();

//         toast.success("Interview added successfully");
//         actions.resetForm();
//         onClose();
//         if (onSuccess) onSuccess();
//       } catch (err) {
//         console.error("Failed to submit interview", err);
//         toast.error(err?.data?.message || "Failed to add interview");
//       }
//     },
//   });

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl w-full max-w-3xl shadow-lg p-8 relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//         >
//           <IoClose size={22} />
//         </button>

//         {/* Title */}
//         <h2
//           className="text-2xl font-semibold text-center mb-6"
//           style={{ color: PRIMARY_COLOR }}
//         >
//           Company Interview Details
//         </h2>

//         <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4 text-[15px]" style={{ color: TEXT_COLOR }}>
//           {/* Row 1 */}
//           <input
//             type="text"
//             name="companyName"
//             placeholder="Company Name"
//             onChange={formik.handleChange}
//             value={formik.values.companyName}
//             className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
//           />
//           <input
//             type="email"
//             name="hrEmail"
//             placeholder="Hr. Email"
//             onChange={formik.handleChange}
//             value={formik.values.hrEmail}
//             className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
//           />

//           {/* Row 2 */}
//           <input
//             type="text"
//             name="contactNumber"
//             placeholder="Contact Number"
//             onChange={formik.handleChange}
//             value={formik.values.contactNumber}
//             className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
//           />
//           <input
//             type="text"
//             name="positionOffered"
//             placeholder="Position Offered"
//             onChange={formik.handleChange}
//             value={formik.values.positionOffered}
//             className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
//           />

//           {/* Job Type */}
//           <div className="flex flex-col">
//             <label className="mb-1 text-sm font-medium">Job Type</label>
//             <div className="flex items-center gap-6">
//               {["Internship", "Job"].map((type) => (
//                 <label key={type} className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="radio"
//                     name="jobType"
//                     value={type}
//                     checked={formik.values.jobType === type}
//                     onChange={formik.handleChange}
//                     className="appearance-none w-5 h-5 border-2 border-gray-400 rounded-full checked:border-[#FDA92D] checked:bg-[#FDA92D] focus:outline-none"
//                   />
//                   {type}
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Required Technology */}
//           <select
//             name="requiredTechnology"
//             onChange={formik.handleChange}
//             value={formik.values.requiredTechnology}
//             className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
//           >
//             <option value="">Required Technology</option>
//             <option value="Java">Java</option>
//             <option value="React">React</option>
//             <option value="Node.js">Node.js</option>
//             <option value="Python">Python</option>
//           </select>

//           {/* Interview Date & Time */}
//           <div className="relative">
//             <input
//               type="text"
//               name="interviewDate"
//               placeholder="Select Date & Time"
//               value={`${formik.values.interviewDate}${formik.values.interviewTime ? ` at ${formik.values.interviewTime}` : ''}`}
//               onClick={() => setShowDatePicker(!showDatePicker)}
//               readOnly
//               className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D] w-full cursor-pointer"
//             />
//             <FaCalendarAlt className="absolute right-3 top-3 text-[#FDA92D]" />
//             {showDatePicker && (
//               <DatePickerComponent
//                 selectedDate={formik.values.interviewDate}
//                 selectedTime={formik.values.interviewTime}
//                 onDateTimeSelect={(date, time) => {
//                   formik.setFieldValue('interviewDate', date);
//                   formik.setFieldValue('interviewTime', time);
//                   setShowDatePicker(false);
//                 }}
//                 onClose={() => setShowDatePicker(false)}
//               />
//             )}
//           </div>

//           {/* Location */}
//           <input
//             type="text"
//             name="location"
//             placeholder="Company Location"
//             onChange={formik.handleChange}
//             value={formik.values.location}
//             className="h-12 border border-gray-300 px-3 rounded-md focus:outline-none focus:border-[#FDA92D]"
//           />

//           {/* Submit Button */}
//           <div className="col-span-2 mt-4">
//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full h-12 rounded-md text-white hover:opacity-90 transition disabled:opacity-50"
//               style={{ backgroundColor: PRIMARY_COLOR }}
//             >
//               {isLoading ? "Submitting..." : "Submit"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Custom Date Picker Component with Time Selection
// const DatePickerComponent = ({ selectedDate, onDateTimeSelect, onClose }) => {
//   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
//   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
//   const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate);
//   const [selectedHour, setSelectedHour] = useState('09');
//   const [selectedMinute, setSelectedMinute] = useState('00');
//   const [selectedPeriod, setSelectedPeriod] = useState('AM');

//   const months = [
//     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//   ];

//   const hours = Array.from({ length: 12 }, (_, i) => {
//     const hour = i + 1;
//     return hour.toString().padStart(2, '0');
//   });

//   const minutes = ['00', '15', '30', '45'];

//   const getDaysInMonth = (month, year) => {
//     return new Date(year, month + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (month, year) => {
//     return new Date(year, month, 1).getDay();
//   };

//   const formatDate = (day) => {
//     const date = new Date(currentYear, currentMonth, day);
//     return date.toLocaleDateString('en-GB');
//   };

//   const handleConfirm = () => {
//     const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
//     onDateTimeSelect(tempSelectedDate, timeString);
//   };

//   const renderCalendar = () => {
//     const daysInMonth = getDaysInMonth(currentMonth, currentYear);
//     const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
//     const days = [];

//     for (let i = 0; i < firstDay; i++) {
//       days.push(<div key={`empty-${i}`} className="h-8"></div>);
//     }

//     for (let day = 1; day <= daysInMonth; day++) {
//       const dateStr = formatDate(day);
//       const isSelected = tempSelectedDate === dateStr;
//       const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

//       days.push(
//         <button
//           key={day}
//           onClick={() => setTempSelectedDate(dateStr)}
//           className={`h-8 w-8 rounded-full text-sm font-medium transition-colors ${isSelected
//             ? 'bg-[#FDA92D] text-white'
//             : isToday
//               ? 'bg-orange-100 text-[#FDA92D]'
//               : 'hover:bg-orange-50 text-gray-700'
//             }`}
//         >
//           {day}
//         </button>
//       );
//     }

//     return days;
//   };

//   return (
//     <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3 w-72 max-h-96 overflow-y-auto sm:w-80 sm:p-4">
//       {/* Calendar Header */}
//       <div className="flex items-center justify-between mb-4">
//         <button
//           onClick={() => {
//             if (currentMonth === 0) {
//               setCurrentMonth(11);
//               setCurrentYear(currentYear - 1);
//             } else {
//               setCurrentMonth(currentMonth - 1);
//             }
//           }}
//           className="p-1 hover:bg-gray-100 rounded"
//         >
//           ←
//         </button>
//         <div className="font-semibold text-gray-700">
//           {months[currentMonth]} {currentYear}
//         </div>
//         <button
//           onClick={() => {
//             if (currentMonth === 11) {
//               setCurrentMonth(0);
//               setCurrentYear(currentYear + 1);
//             } else {
//               setCurrentMonth(currentMonth + 1);
//             }
//           }}
//           className="p-1 hover:bg-gray-100 rounded"
//         >
//           →
//         </button>
//       </div>

//       {/* Days of week */}
//       <div className="grid grid-cols-7 gap-1 mb-2">
//         {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
//           <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
//             {day}
//           </div>
//         ))}
//       </div>

//       {/* Calendar grid */}
//       <div className="grid grid-cols-7 gap-1 mb-4">
//         {renderCalendar()}
//       </div>

//       {/* Time Selection */}
//       {tempSelectedDate && (
//         <div className="border-t pt-4">
//           <div className="text-center mb-3">
//             <h4 className="font-semibold text-gray-700">Select Time</h4>
//           </div>

//           <div className="flex justify-center items-center space-x-2 mb-4">
//             <select
//               value={selectedHour}
//               onChange={(e) => setSelectedHour(e.target.value)}
//               className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FDA92D]"
//             >
//               {hours.map(hour => (
//                 <option key={hour} value={hour}>{hour}</option>
//               ))}
//             </select>
//             <span className="font-bold text-gray-600">:</span>
//             <select
//               value={selectedMinute}
//               onChange={(e) => setSelectedMinute(e.target.value)}
//               className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FDA92D]"
//             >
//               {minutes.map(minute => (
//                 <option key={minute} value={minute}>{minute}</option>
//               ))}
//             </select>
//             <select
//               value={selectedPeriod}
//               onChange={(e) => setSelectedPeriod(e.target.value)}
//               className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#FDA92D]"
//             >
//               <option value="AM">AM</option>
//               <option value="PM">PM</option>
//             </select>
//           </div>
//         </div>
//       )}

//       {/* Action buttons */}
//       <div className="flex justify-end space-x-2">
//         <button
//           onClick={onClose}
//           className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleConfirm}
//           disabled={!tempSelectedDate}
//           className="px-3 py-1 text-sm bg-[#FDA92D] text-white rounded hover:opacity-90 disabled:opacity-50"
//         >
//           Confirm
//         </button>
//       </div>
//     </div>
//   );
// };



// export default ScheduleInterviewModal;