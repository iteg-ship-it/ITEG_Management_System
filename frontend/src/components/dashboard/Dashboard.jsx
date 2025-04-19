import { Routes, Route } from "react-router-dom";
import AdmissionProcess from "../admition-process/admition-process-page/AdmissionProcess";
import StudentProfile from "../student-records/studentProfile/StudentProfile";
import PlacementRecords from "../placement/placement-records/PlacementRecords";
import AdmissionDashboard from "../admition-process/admission-dashboard/AdmissionDashboard";
import AdmitionRecords from "../admition-process/admition-records/AdmitionRecords";
import StudentEditPage from "../student-records/student-edit-page/StudentEditPage";
import StudentDashboard from "../student-records/student-dashboard/StudentDashboard";
import StudentDetailTable from "../student-records/student-detail-table/StudentDetailTable";
// import LoginPage from "../common-components/login&registration/LoginPage";
// import SignupPage from "./../common-components/signup/SignupPage";

const Dashboard = () => {
  const role = getDecryptedRole();

  if (!role) return <Navigate to="/login" />;

  return (
    <Routes>
      {role === "admin" && (
        <>
          <Route path="/" element={<AdmissionDashboard />} />
          <Route path="/admission" element={<AdmissionProcess />} />
          <Route path="/admition-record" element={<AdmitionRecords />} />
        </>
      )}

      {["admin", "teacher"].includes(role) && (
        <>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route
            path="/student-detail-table"
            element={<StudentDetailTable />}
          />
          <Route path="/student-edit-profile" element={<StudentEditPage />} />
        </>
      )}

      {["admin", "teacher", "student"].includes(role) && (
        <>
          <Route path="/placement" element={<PlacementRecords />} />
          <Route
            path="/student-profile/:studentId"
            element={<StudentProfile />}
          />
        </>
      )}
    </Routes>
  );
};

export default Dashboard;

// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import AdmissionProcess from "../admition-process/admition-process-page/AdmissionProcess";
// import StudentProfile from "../student-records/studentProfile/StudentProfile";
// import PlacementRecords from "../placement/placement-records/PlacementRecords";
// import AdmissionDashboard from "../admition-process/admission-dashboard/AdmissionDashboard";
// import AdmitionRecords from "../admition-process/admition-records/AdmitionRecords";
// import StudentEditPage from "../student-records/student-edit-page/StudentEditPage";
// import StudentDashboard from "../student-records/student-dashboard/StudentDashboard";
// import StudentDetailTable from "../student-records/student-detail-table/StudentDetailTable";
// import LoginPage from "../common-components/login&registration/LoginPage";
// import SignupPage from "./../common-components/signup/SignupPage";

// const Dashboard = () => {
//   return (
//     <>
//       <Routes>
//         <Route path="/" element={<AdmissionDashboard />} />
//         <Route path="/admission" element={<AdmissionProcess />} />
//         <Route path="/admition-record" element={<AdmitionRecords />} />
//         <Route path="/student-dashboard" element={<StudentDashboard />} />
//         <Route path="/student-detail-table" element={<StudentDetailTable />} />
//         <Route path="/student-edit-profile" element={<StudentEditPage />} />
//         <Route path="/placement" element={<PlacementRecords />} />
//         <Route
//           path="/student-profile/:studentId"
//           element={<StudentProfile />}
//         />
//       </Routes>
//     </>
//   );
// };

// export default Dashboard;
