import React, { useState } from "react";
import { FaUserGraduate, FaBook, FaInfoCircle } from "react-icons/fa";
import "tailwindcss/tailwind.css";

const roles = {
  admin: ["Admission Process", "Student Record", "Placement Information"],
  teacher: ["Student Record", "Placement Information"],
  student: ["Placement Information"],
};

const Sidebar = ({ role }) => {
  return (
    <div className="w-64 min-h-screen bg-gray-100 p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-4">Sant Singaji Educational Society</h2>
      <ul>
        {roles[role].map((item, index) => (
          <li key={index} className="p-2 text-gray-700 hover:bg-gray-200 rounded-md cursor-pointer">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

const DashboardCard = ({ title }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 text-center w-1/4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex justify-around text-blue-600">
        <p className="font-bold">40</p>
        <p className="text-green-600">40</p>
        <p className="text-red-600">40</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [role, setRole] = useState("admin");
  return (
    <div className="flex">
      <Sidebar role={role} />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Admission Dashboard</h1>
        {/* <div className="flex gap-4 flex-wrap">
          <DashboardCard title="Selected" />
          <DashboardCard title="Rejected" />
          <DashboardCard title="Total Registration" />
          <DashboardCard title="Total Student" />
        </div> */}
        {/* <div className="mt-6">
          <h2 className="text-xl font-bold">Track Wise Data</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            {["Harda", "Kannod", "Satwas", "Narsullaganj", "Khategaon"].map((track) => (
              <DashboardCard key={track} title={track} />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Dashboard;
