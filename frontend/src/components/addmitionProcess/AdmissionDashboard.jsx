import React from "react";

const AdmissionDashboard = () => {
  const data = [
    {
      location: "Harda",
      selected: 40,
      rejected: 40,
      totalRegistration: 40,
      totalStudents: 40,
      paid: 40,
      unpaid: 40,
    },
    {
      location: "Kannod",
      selected: 40,
      rejected: 40,
      totalRegistration: 40,
      totalStudents: 40,
      paid: 40,
      unpaid: 40,
    },
    {
      location: "Satwas",
      selected: 40,
      rejected: 40,
      totalRegistration: 40,
      totalStudents: 40,
      paid: 40,
      unpaid: 40,
    },
    {
      location: "Narsullaganj",
      selected: 40,
      rejected: 40,
      totalRegistration: 40,
      totalStudents: 40,
      paid: 40,
      unpaid: 40,
    },
    {
      location: "Khategaon",
      selected: 40,
      rejected: 40,
      totalRegistration: 40,
      totalStudents: 40,
      paid: 40,
      unpaid: 40,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-6">Admission Dashboard</h1>

      {/* Main Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* ... stat cards ... */}
      </div>

      <h2 className="text-xl font-semibold mb-4">
        Track-wise data of students
      </h2>

      {/* Location-wise Data */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{item.location}</h3>
              <button className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-blue-500">
                  {item.selected}
                </span>
                <p className="text-sm text-gray-600 mt-1">Selected</p>
              </div>
              <div className="bg-red-100 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-red-500">
                  {item.rejected}
                </span>
                <p className="text-sm text-gray-600 mt-1">Rejected</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-gray-500">
                  {item.totalRegistration}
                </span>
                <p className="text-sm text-gray-600 mt-1">Total Registration</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <span className="text-2xl font-bold text-green-500">
                  {item.totalStudents}
                </span>
                <p className="text-sm text-gray-600 mt-1">Total Students</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionDashboard;
