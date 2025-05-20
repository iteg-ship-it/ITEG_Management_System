/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useInterviewCreateMutation } from '../../../redux/api/authApi';

const CustomTimeDate = ({ isOpen, onClose, student }) => {
  const [formData, setFormData] = useState({
    round: 'First',
    attemptNo: '',
    assignment: '',
    communication: '',
    confidence: '',
    goal: '',
    subjectKnowlage: '',
    assignmentMarks: '',
    sincerity: '',
    maths: '',
    reasoning: '',
    marks: '',
    remark: '',
    date: '',
    created_by: '', // Can be filled automatically or by user
    result: 'Pending'
  });

  const [createInterview, { isLoading }] = useInterviewCreateMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      created_by: 'admin', // Or replace dynamically
      studentId: student?.id
    };

    try {
      await createInterview(payload).unwrap();
      onClose();
    } catch (err) {
      console.error('Interview submission failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
<div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[95vh] overflow-y-visible relative">
        <h2 className="text-2xl font-bold text-center text-orange-500 mb-4">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Select Round */}
          <div>
            <label className="text-sm font-medium">Round</label>
            <select name="round" value={formData.round} onChange={handleChange} className="w-full border rounded p-2">
              <option value="First">First</option>
              <option value="Second">Second</option>
            </select>
          </div>

          <InputField label="Attempt No" name="attemptNo" value={formData.attemptNo} onChange={handleChange} type="number" />
          <InputField label="Assignment" name="assignment" value={formData.assignment} onChange={handleChange} />
          <InputField label="Communication" name="communication" value={formData.communication} onChange={handleChange} type="number" />
          <InputField label="Confidence" name="confidence" value={formData.confidence} onChange={handleChange} type="number" />
          <InputField label="Goal" name="goal" value={formData.goal} onChange={handleChange} type="number" />
          <InputField label="Subject Knowledge" name="subjectKnowlage" value={formData.subjectKnowlage} onChange={handleChange} type="number" />
          <InputField label="Assignment Marks" name="assignmentMarks" value={formData.assignmentMarks} onChange={handleChange} type="number" />
          <InputField label="Sincerity" name="sincerity" value={formData.sincerity} onChange={handleChange} type="number" />
          <InputField label="Maths" name="maths" value={formData.maths} onChange={handleChange} type="number" />
          <InputField label="Reasoning" name="reasoning" value={formData.reasoning} onChange={handleChange} type="number" />
          <InputField label="Total Marks" name="marks" value={formData.marks} onChange={handleChange} type="number" />

          {/* ✅ Remark - Half Width */}
          <InputField label="Remark" name="remark" value={formData.remark} onChange={handleChange} />

          {/* ✅ Created By - Right beside Remark */}
          <InputField label="Created By" name="created_by" value={formData.created_by} onChange={handleChange} />

          {/* Date and Result */}
          <InputField label="Date" name="date" value={formData.date} onChange={handleChange} type="datetime-local" />
          <div>
            <label className="text-sm font-medium">Result</label>
            <select name="result" value={formData.result} onChange={handleChange} className="w-full border rounded p-2">
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </form>

        <div className="flex justify-end gap-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// Reusable input component
const InputField = ({ label, name, value, onChange, type = 'text' }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border rounded p-2"
    />
  </div>
);

export default CustomTimeDate;





// /* eslint-disable react/prop-types */
// import { useState } from "react";
// import { FaRegClock } from "react-icons/fa";

// export default function CustomTimeDate({ onClose }) {
//   const [candidateName, setCandidateName] = useState("");
//   const [interviewerName, setInterviewerName] = useState("");
//   const [date, setDate] = useState("");

//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [hour, setHour] = useState("06");
//   const [minute, setMinute] = useState("28");
//   const [period, setPeriod] = useState("PM");

//   const handleSaveTime = () => {
//     setShowTimePicker(false);
//   };

//   const handleSend = () => {
//     const interviewDetails = {
//       candidateName,
//       interviewerName,
//       date,
//       time: `${hour}:${minute} ${period}`,
//     };
//     console.log("Interview Scheduled:", interviewDetails);
//     onClose(); // Close the modal
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl">
//         {/* Modal Header */}
//         <h2 className="bg-orange-400 text-2xl font-bold text-white p-4 text-center rounded-t-xl">
//           Schedule Interview
//         </h2>

//         {/* Form Content */}
//         <div className="space-y-6 p-6 sm:p-10 md:p-14">
//           {/* Input Fields */}
//           <div className="flex flex-col md:flex-row items-center gap-4">
//             <input
//               type="text"
//               placeholder="Candidate Name"
//               value={candidateName}
//               onChange={(e) => setCandidateName(e.target.value)}
//               className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             />
//             <input
//               type="text"
//               placeholder="Interviewer Name"
//               value={interviewerName}
//               onChange={(e) => setInterviewerName(e.target.value)}
//               className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             />
//           </div>

//           {/* Date & Time Pickers */}
//           <div className="flex flex-col md:flex-row items-center gap-4 relative">
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
//             />

//             <div
//               className="w-full border rounded-xl p-4 cursor-pointer flex justify-between items-center"
//               onClick={() => setShowTimePicker(!showTimePicker)}
//             >
//               <span className="text-gray-600">{`${hour}:${minute} ${period}`}</span>
//               <FaRegClock className="text-gray-500" />
//             </div>

//             {/* Time Picker Dropdown */}
//             {showTimePicker && (
//               <div className="absolute top-full mt-2 right-0 z-20 bg-white border shadow-xl rounded-xl p-4 w-64">
//                 <h3 className="text-orange-500 font-semibold text-lg mb-4">
//                   Set time
//                 </h3>

//                 <div className="flex justify-center items-center space-x-4 text-lg font-semibold text-orange-500">
//                   {/* Hours */}
//                   <div className="relative h-32 w-14 overflow-y-scroll no-scrollbar text-center">
//                     {Array.from({ length: 12 }, (_, i) => {
//                       const h = String(i + 1).padStart(2, "0");
//                       const isSelected = hour === h;
//                       return (
//                         <div
//                           key={h}
//                           onClick={() => setHour(h)}
//                           className={`py-2 cursor-pointer ${
//                             isSelected
//                               ? "text-orange-500 font-bold bg-orange-100 rounded"
//                               : "text-black"
//                           }`}
//                         >
//                           {h}
//                         </div>
//                       );
//                     })}
//                     <div className="absolute top-1/2 left-0 right-0 h-8 pointer-events-none border-t border-b border-orange-300 -mt-4" />
//                   </div>

//                   {/* Colon */}
//                   <div className="flex items-center justify-center h-32">
//                     <span className="text-gray-600 text-xl">:</span>
//                   </div>

//                   {/* Minutes */}
//                   <div className="relative h-32 w-14 overflow-y-scroll no-scrollbar text-center">
//                     {Array.from({ length: 60 }, (_, i) => {
//                       const m = String(i).padStart(2, "0");
//                       const isSelected = minute === m;
//                       return (
//                         <div
//                           key={m}
//                           onClick={() => setMinute(m)}
//                           className={`py-2 cursor-pointer ${
//                             isSelected
//                               ? "text-orange-500 font-bold bg-orange-100 rounded"
//                               : "text-black"
//                           }`}
//                         >
//                           {m}
//                         </div>
//                       );
//                     })}
//                     <div className="absolute top-1/2 left-0 right-0 h-8 pointer-events-none border-t border-b border-orange-300 -mt-4" />
//                   </div>

//                   {/* AM/PM */}
//                   <div className="relative h-32 w-14 overflow-y-scroll no-scrollbar text-center">
//                     {["AM", "PM"].map((p) => {
//                       const isSelected = period === p;
//                       return (
//                         <div
//                           key={p}
//                           onClick={() => setPeriod(p)}
//                           className={`py-2 cursor-pointer ${
//                             isSelected
//                               ? "text-orange-500 font-bold bg-orange-100 rounded"
//                               : "text-black"
//                           }`}
//                         >
//                           {p}
//                         </div>
//                       );
//                     })}
//                     <div className="absolute top-1/2 left-0 right-0 h-8 pointer-events-none border-t border-b border-orange-300 -mt-4" />
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex justify-between mt-6">
//                   <button
//                     onClick={() => setShowTimePicker(false)}
//                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleSaveTime}
//                     className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Footer Buttons */}
//           <div className="flex justify-end mt-6">
//             <button
//               onClick={onClose}
//               className="w-36 px-4 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 mr-4"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSend}
//               className="w-36 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
//             >
//               Send
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
