/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaRegClock } from "react-icons/fa";

export default function CustomTimeDate({ onClose }) {
  const [candidateName, setCandidateName] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [date, setDate] = useState("");

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hour, setHour] = useState("06");
  const [minute, setMinute] = useState("28");
  const [period, setPeriod] = useState("PM");

  const handleSaveTime = () => {
    setShowTimePicker(false);
  };

  const handleSend = () => {
    const interviewDetails = {
      candidateName,
      interviewerName,
      date,
      time: `${hour}:${minute} ${period}`,
    };
    console.log("Interview Scheduled:", interviewDetails);
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl">
        {/* Modal Header */}
        <h2 className="bg-orange-400 text-2xl font-bold text-white p-4 text-center rounded-t-xl">
          Schedule Interview
        </h2>

        {/* Form Content */}
        <div className="space-y-6 p-6 sm:p-10 md:p-14">
          {/* Input Fields */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="text"
              placeholder="Candidate Name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text"
              placeholder="Interviewer Name"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Date & Time Pickers */}
          <div className="flex flex-col md:flex-row items-center gap-4 relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <div
              className="w-full border rounded-xl p-4 cursor-pointer flex justify-between items-center"
              onClick={() => setShowTimePicker(!showTimePicker)}
            >
              <span className="text-gray-600">{`${hour}:${minute} ${period}`}</span>
              <FaRegClock className="text-gray-500" />
            </div>

            {/* Time Picker Dropdown */}
            {showTimePicker && (
              <div className="absolute top-full mt-2 right-0 z-20 bg-white border shadow-xl rounded-xl p-4 w-64">
                <h3 className="text-orange-500 font-semibold text-lg mb-4">
                  Set time
                </h3>

                <div className="flex justify-center items-center space-x-4 text-lg font-semibold text-orange-500">
                  {/* Hours */}
                  <div className="relative h-32 w-14 overflow-y-scroll no-scrollbar text-center">
                    {Array.from({ length: 12 }, (_, i) => {
                      const h = String(i + 1).padStart(2, "0");
                      const isSelected = hour === h;
                      return (
                        <div
                          key={h}
                          onClick={() => setHour(h)}
                          className={`py-2 cursor-pointer ${
                            isSelected
                              ? "text-orange-500 font-bold bg-orange-100 rounded"
                              : "text-black"
                          }`}
                        >
                          {h}
                        </div>
                      );
                    })}
                    <div className="absolute top-1/2 left-0 right-0 h-8 pointer-events-none border-t border-b border-orange-300 -mt-4" />
                  </div>

                  {/* Colon */}
                  <div className="flex items-center justify-center h-32">
                    <span className="text-gray-600 text-xl">:</span>
                  </div>

                  {/* Minutes */}
                  <div className="relative h-32 w-14 overflow-y-scroll no-scrollbar text-center">
                    {Array.from({ length: 60 }, (_, i) => {
                      const m = String(i).padStart(2, "0");
                      const isSelected = minute === m;
                      return (
                        <div
                          key={m}
                          onClick={() => setMinute(m)}
                          className={`py-2 cursor-pointer ${
                            isSelected
                              ? "text-orange-500 font-bold bg-orange-100 rounded"
                              : "text-black"
                          }`}
                        >
                          {m}
                        </div>
                      );
                    })}
                    <div className="absolute top-1/2 left-0 right-0 h-8 pointer-events-none border-t border-b border-orange-300 -mt-4" />
                  </div>

                  {/* AM/PM */}
                  <div className="relative h-32 w-14 overflow-y-scroll no-scrollbar text-center">
                    {["AM", "PM"].map((p) => {
                      const isSelected = period === p;
                      return (
                        <div
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={`py-2 cursor-pointer ${
                            isSelected
                              ? "text-orange-500 font-bold bg-orange-100 rounded"
                              : "text-black"
                          }`}
                        >
                          {p}
                        </div>
                      );
                    })}
                    <div className="absolute top-1/2 left-0 right-0 h-8 pointer-events-none border-t border-b border-orange-300 -mt-4" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setShowTimePicker(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTime}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="w-36 px-4 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 mr-4"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="w-36 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
