// import React from "react";

// const StudentRecord = () => {
//   return (
//     <>
//       <div className="p-6 w-full">
//         {/* Top Header Placeholder */}
//         <div className="bg-white p-6 rounded-lg shadow-md h-[500px]">
//           <div className="bg-gray-300 h-10 w-1/3 rounded-md mb-6"></div>

//           {/* Year-wise Cards Section */}
//           <div className="flex gap-6">
//             <div className="flex-1 bg-green-200 p-6 rounded-lg font-semibold text-lg shadow h-[300px] w-[100px]">
//               1st Year
//             </div>
//             <div className="flex-1 bg-red-200 p-6 rounded-lg font-semibold text-lg shadow">
//               2nd Year
//             </div>
//             <div className="flex-1 bg-orange-200 p-6 rounded-lg font-semibold text-lg shadow">
//               3rd Year
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default StudentRecord;

import React, { useState } from "react";

const StudentRecord = () => {
  const [selectedYear, setSelectedYear] = useState(null);

  const studentsData = {
    1: ["Alice", "Bob", "Charlie"],
    2: ["David", "Emma", "Frank"],
    3: ["George", "Hannah", "Ian"],
  };

  return (
    <div className="p-6 w-full">
      {/* Top Header Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[500px]">
        <div className="bg-gray-300 h-10 w-1/3 rounded-md mb-6"></div>

        {/* Year-wise Cards Section */}
        <div className="flex gap-6">
          {[1, 2, 3].map((year) => (
            <div
              key={year}
              className={`flex-1 p-6 rounded-lg font-semibold text-lg shadow cursor-pointer transition-all duration-200 hover:scale-105 ${
                year === 1
                  ? "bg-green-200"
                  : year === 2
                  ? "bg-red-200"
                  : "bg-orange-200"
              }`}
              onClick={() => setSelectedYear(year)}
            >
              {year}st Year
            </div>
          ))}
        </div>

        {/* Student List Display */}
        {selectedYear && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">
              {selectedYear}st Year Students
            </h2>
            <ul className="list-disc pl-5">
              {studentsData[selectedYear].map((student, index) => (
                <li key={index} className="text-lg">
                  {student}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentRecord;
