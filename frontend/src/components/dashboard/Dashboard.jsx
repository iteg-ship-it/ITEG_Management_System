import React, { useState } from "react";
import Sidebar from "../common-components/sidebar/Sidebar";
import AdmissionDashboard from "../admitionProcess/AdmissionDashboard";
// import AdmitionProcess from '../admitionProcess/AdmitionProcess';
const DashboardCard = ({ title }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 text-center w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
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
  const [role] = useState("admin");

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role={role} />
      {/* <AdmitionProcess /> */}
      <AdmissionDashboard />

      {/* <div className="flex-1 p-6 md:ml-64">
        <h1 className="text-2xl font-bold mb-4">Admission Dashboard</h1>
        <div className="flex gap-4 flex-wrap">
          <DashboardCard title="Selected" />
          <DashboardCard title="Rejected" />
          <DashboardCard title="Total Registration" />
          <DashboardCard title="Total Student" />
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
