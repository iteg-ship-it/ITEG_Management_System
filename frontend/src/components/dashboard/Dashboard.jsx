import React from "react";
import { Routes, Route } from "react-router-dom";
import AdmissionDashboard from "../admitionProcess/admition-dashboard/AdmissionDashboard";
import StudentRecord from "../student-records/student-dashboard/StudentRecord";
import StudentProfile from "../student-records/studentProfile/StudentProfile";
import PlacementRecords from "../placement/placement-records/PlacementRecords";
import AdminDashboard from "./../admin-dashboard/AdminDashboard";
import AdmitionRecords from "../admitionProcess/admition-records/AdmitionRecords";
import StudentEditPage from "../student-records/student-edit-page/StudentEditPage";

const Dashboard = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admission" element={<AdmissionDashboard />} />
        <Route path="/admition-record" element={<AdmitionRecords />} />
        <Route path="/student-record" element={<StudentRecord />} />
        <Route path="/student-edit-profile" element={<StudentEditPage />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/placement" element={<PlacementRecords />} />
      </Routes>
    </>
  );
};

// const Dashboard = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<AdminDashboard />} />
//       <Route path="/admission" element={<AdmissionDashboard />} />
//       <Route path="/student-profiles" element={<StudentProfiles />} />
//       <Route path="/permission-students" element={<PermissionStudents />} />
//       <Route path="/attendance-info" element={<AttendanceInfo />} />
//       <Route path="/level-info" element={<LevelInfo />} />
//       <Route path="/interview-record" element={<InterviewRecord />} />
//       <Route path="/readiness-status" element={<ReadinessStatus />} />
//       <Route path="/placement-interview-record" element={<PlacementInterviewRecord />} />
//       <Route path="/company-data" element={<CompanyData />} />
//       <Route path="/placement-post" element={<PlacementPost />} />
//     </Routes>
//   );
// };

export default Dashboard;
