import React from "react";

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

const AdmissionDashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen w-[75vw]">
      <h1 className="text-2xl font-bold mb-6">Admission Dashboard</h1>

      {/* Top Summary Row */}
      <div className="bg-white shadow-md p-6 rounded-lg flex justify-between items-center">
        {["Selected", "Rejected", "Total Registration", "Total Student"].map((title, index) => (
          <div key={index} className="text-center flex-1 border-r last:border-r-0">
            <p className="text-lg font-semibold">{title}</p>
            <div className="flex justify-center gap-2 mt-2">
              <div className="bg-blue-100 text-blue-500 font-bold px-3 py-1 rounded-md">40</div>
              <div className="bg-red-100 text-red-500 font-bold px-3 py-1 rounded-md">40</div>
              <div className="bg-green-100 text-green-500 font-bold px-3 py-1 rounded-md">40</div>
            </div>
            <div className="flex justify-center gap-4 text-sm text-gray-500 mt-1">
              <span>Total</span>
              <span>Paid</span>
              <span>Unpaid</span>
            </div>
          </div>
        ))}
      </div>

      {/* Location-wise Data */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Track-wise Data of Students</h2>
      <div className="space-y-4">
        {data.map((locationData, index) => (
          <div key={index} className="bg-white shadow-md p-6 rounded-lg">
            {/* <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{locationData.location}</h3>
              <button className="text-gray-500 hover:text-gray-700">
                👁️
              </button>
            </div> */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { title: locationData.location, value: locationData.selected },
                { title: "Rejected", value: locationData.rejected },
                { title: "Total Registration", value: locationData.totalRegistration },
                { title: "Total Students", value: locationData.totalStudents },
              ].map((item, idx) => (
                <div key={idx} className="text-center border-r last:border-r-0">
                  <p className="text-md font-medium">{item.title}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <div className="bg-blue-100 text-blue-500 font-bold px-3 py-1 rounded-md">{item.value}</div>
                    <div className="bg-red-100 text-red-500 font-bold px-3 py-1 rounded-md">{locationData.paid}</div>
                    <div className="bg-green-100 text-green-500 font-bold px-3 py-1 rounded-md">{locationData.unpaid}</div>
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-gray-500 mt-1">
                    <span>Total</span>
                    <span>Paid</span>
                    <span>Unpaid</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionDashboard;
