import React from "react";
import { Routes, Route } from "react-router-dom";
import AdmissionProcess from "../admitionProcess/admition-process-page/AdmissionProcess";
import StudentProfile from "../student-records/studentProfile/StudentProfile";
import PlacementRecords from "../placement/placement-records/PlacementRecords";
import AdmissionDashboard from "../admitionProcess/admission-dashboard/AdmissionDashboard";
import AdmitionRecords from "../admitionProcess/admition-records/AdmitionRecords";
import StudentEditPage from "../student-records/student-edit-page/StudentEditPage";
import StudentDashboard from "../student-records/student-dashboard/StudentDashboard";
import StudentDetailTable from "../student-records/student-detail-table/StudentDetailTable";

const Dashboard = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<AdmissionDashboard />} />
        <Route path="/admission" element={<AdmissionProcess />} />
        <Route path="/admition-record" element={<AdmitionRecords />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student-detail-table" element={<StudentDetailTable />} />
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
