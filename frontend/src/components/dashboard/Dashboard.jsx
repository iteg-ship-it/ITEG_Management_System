import React from "react";
import { Routes, Route } from "react-router-dom";
import AdmissionDashboard from "../admitionProcess/admition-dashboard/AdmissionDashboard";
import StudentRecord from "../student-records/student-record/StudentRecord";
import StudentProfile from "../student-records/studentProfile/StudentProfile";
import PlacementRecords from "../placement/placementRecords/PlacementRecords";
import AdminDashboard from "./../admin-dashboard/AdminDashboard";
import AdmitionRecords from "../admitionProcess/admition-records/AdmitionRecords";

const Dashboard = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admission" element={<AdmissionDashboard />} />
        <Route path="/admition-record" element={<AdmitionRecords />} />
        <Route path="/student-record" element={<StudentRecord />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/placement" element={<PlacementRecords />} />
      </Routes>
    </>
  );
};

export default Dashboard;
