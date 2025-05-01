import { useState } from "react";
import { FaRegClock } from "react-icons/fa";

export default function CustomTimeDate() {
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

  return (
    <div className="w-auto max-w-3xl mx-auto">
      <div>
        <h2 className="bg-orange-400 text-2xl font-bold text-white p-4 text-center w-full py-3 rounded-t-md border-t-4 border-blue-400">
          Schedule Interview
        </h2>
      </div>

      <div className="space-y-8 p-14">
        {/* Input fields */}
        <div className="flex items-center space-x-4">
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

        {/* Date & Time Picker */}
        <div className="flex items-center space-x-2 relative">
          <input
            type="date"
            placeholder="dd/mm/yy"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {/* Time Picker Display */}
          <div
            className="w-full border rounded-xl p-4 cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-orange-400"
            onClick={() => setShowTimePicker(!showTimePicker)}
          >
            <span className="text-gray-500">{`${hour}:${minute} ${period}`}</span>
            <FaRegClock className="text-gray-500" />
          </div>

          {showTimePicker && (
            <div className="absolute top-20 right-0 z-20 bg-white border shadow-xl rounded-xl p-4 w-64">
              <h3 className="text-orange-500 font-semibold text-lg mb-4">
                Set time
              </h3>

              {/* <div className="flex justify-center items-center space-x-4 text-lg font-semibold text-orange-500"> */}

              <div className="flex justify-center items-center space-x-4 text-lg font-semibold text-orange-500">
                {/* Hour List */}
                {/* <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md"> */}
                <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md">
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return (
                      <div
                        key={h}
                        onClick={() => setHour(h)}
                        className={`cursor-pointer py-2 w-full text-center ${
                          hour === h ? " text-orange-500 " : "text-black"
                        }`}
                      >
                        {h}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center h-32">
                  <span className="text-gray-600 text-xl">:</span>
                </div>

                {/* Minute List */}
                {/* <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md"> */}
                <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md">
                  {Array.from({ length: 60 }, (_, i) => {
                    const m = String(i).padStart(2, "0");
                    return (
                      <div
                        key={m}
                        onClick={() => setMinute(m)}
                        className={`cursor-pointer py-2 w-full text-center ${
                          minute === m ? " text-orange-500 " : "text-black"
                        }`}
                      >
                        {m}
                      </div>
                    );
                  })}
                </div>

                {/* AM/PM */}
                {/* <div className="h-32 flex flex-col justify-center w-14 rounded-md"> */}
                <div className="h-32 flex flex-col justify-center w-14 rounded-md">
                  {["AM", "PM"].map((p) => (
                    <div
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`cursor-pointer py-2 text-center ${
                        period === p ? " text-orange-500 " : "text-black"
                      }`}
                    >
                      {p}
                    </div>
                  ))}
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
          {showTimePicker && (
            <div className="absolute top-20 right-0 z-20 bg-white border shadow-xl rounded-xl p-4 w-72">
              <h3 className="text-orange-500 font-semibold text-lg mb-4">
                Set time
              </h3>

              {/* Time Picker Columns */}
              <div className="flex justify-center items-center space-x-4 text-lg font-semibold text-orange-500">
                {/* Hour List */}
                <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md">
                  {Array.from({ length: 12 }, (_, i) => {
                    const h = String(i + 1).padStart(2, "0");
                    return (
                      <div
                        key={h}
                        onClick={() => setHour(h)}
                        className={`cursor-pointer py-2 w-full text-center ${
                          hour === h
                            ? "text-orange-500 font-bold"
                            : "text-black"
                        }`}
                      >
                        {h}
                      </div>
                    );
                  })}
                </div>

                {/* Colon */}
                <div className="flex items-center justify-center h-32">
                  <span className="text-gray-600 text-xl">:</span>
                </div>

                {/* Minute List */}
                <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md">
                  {Array.from({ length: 60 }, (_, i) => {
                    const m = String(i).padStart(2, "0");
                    return (
                      <div
                        key={m}
                        onClick={() => setMinute(m)}
                        className={`cursor-pointer py-2 w-full text-center ${
                          minute === m
                            ? "text-orange-500 font-bold"
                            : "text-black"
                        }`}
                      >
                        {m}
                      </div>
                    );
                  })}
                </div>

                {/* AM/PM Scrollable List */}
                <div className="h-32 overflow-y-scroll no-scrollbar flex flex-col items-center w-14 rounded-md">
                  {["AM", "PM"].map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPeriod(p)}
                      className={`cursor-pointer py-2 w-full text-center ${
                        period === p
                          ? "text-orange-500 font-bold"
                          : "text-black"
                      }`}
                    >
                      {p}
                    </div>
                  ))}
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

        {/* Submit/Cancel Buttons */}
        <div className="flex justify-self-end mt-6">
          <button className="w-44 px-4 py-3 bg-gray-300 rounded-xl hover:bg-gray-400 mr-4">
            Cancel
          </button>
          <button className="w-44 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
