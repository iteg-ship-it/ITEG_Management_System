import React from "react";
import { useNavigate } from "react-router-dom";

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
    location: "Nemawar",
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

const AdmissionProcess = () => {
  const navigate = useNavigate();

  const handleLocationClick = (location) => {
    navigate(`/admition-record?location=${location}`);
  };
  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">
        Admission Dashboard
      </h1>

      {/* ✅ Top Summary Section with Dividers */}
      <div className="bg-white shadow-md p-6 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {["Selected", "Rejected", "Total Registration", "Total Students"].map(
            (title, index) => (
              <div key={index} className="relative flex flex-col items-center">
                <p className="text-lg font-semibold">{title}</p>
                <div className="flex justify-center gap-2 mt-2">
                  <div className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-md">
                    40
                  </div>
                  <div className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-md">
                    40
                  </div>
                  <div className="bg-green-100 text-green-600 font-bold px-3 py-1 rounded-md">
                    40
                  </div>
                </div>
                <div className="flex justify-center gap-4 text-sm text-gray-500 mt-1">
                  <span>Total</span>
                  <span>Paid</span>
                  <span>Unpaid</span>
                </div>
                {/* Divider for Desktop View */}
                {index !== 3 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-12 w-[1px] bg-gray-300"></div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* ✅ Location-wise Data with Clickable Locations */}
      <h2 className="text-xl font-semibold mt-8 mb-4">
        Track-wise Data of Students
      </h2>
      <div className="space-y-4">
        {data.map((locationData, index) => (
          <div
            key={index}
            className="bg-white shadow-md p-6 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { title: locationData.location, value: locationData.selected },
                { title: "Rejected", value: locationData.rejected },
                {
                  title: "Total Registration",
                  value: locationData.totalRegistration,
                },
                { title: "Total Students", value: locationData.totalStudents },
              ].map((item, idx) => (
                <div key={idx} className="relative text-center">
                  <p
                    className={`text-md font-medium ${
                      item.title === locationData.location
                        ? "cursor-pointer text-black hover:underline"
                        : ""
                    }`}
                    onClick={
                      item.title === locationData.location
                        ? () => handleLocationClick(locationData.location)
                        : undefined
                    }
                  >
                    {item.title}
                  </p>
                  <div className="flex justify-center gap-2 mt-2">
                    <div className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-md">
                      {item.value}
                    </div>
                    <div className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-md">
                      {locationData.paid}
                    </div>
                    <div className="bg-green-100 text-green-600 font-bold px-3 py-1 rounded-md">
                      {locationData.unpaid}
                    </div>
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-gray-500 mt-1">
                    <span>Total</span>
                    <span>Paid</span>
                    <span>Unpaid</span>
                  </div>
                  {idx !== 3 && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 h-12 w-[1px] bg-gray-300 hidden md:block"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionProcess;
