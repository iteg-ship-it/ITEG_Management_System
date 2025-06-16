import { Routes, Route } from "react-router-dom";

// Admission process components
import AdmissionDashboard from "../admition-process/AdmissionDashboard";
import AdmissionProcess from "../admition-process/AdmissionProcess";
import AdmissionEditPage from "../admition-process/AdmissionEditPage";
import AdmissionInterviewDetails from "../admition-process/AdmissionInterviewDetails";
import AdmissionRecords from "../admition-process/AdmitionRecords";

// Student records components
import StudentDashboard from "../student-records/StudentDashboard";
import StudentDetailTable from "../student-records/StudentDetailTable";
import StudentEditPage from "../student-records/StudentEditPage";
import StudentProfile from "../student-records/StudentProfile";
import StudentLevelData from "../student-records/StudentLevelData";
// Placement components
import PlacementReadyStudents from "../placement/PlacementReadyStudents";
import StudentPermission from "../student-records/StudentPermission";
import PlacementRecords from "../placement/PlacementRecords";
import PlacementPost from "../placement/PlacementPost";

const routes = [
  { path: "/", element: <AdmissionDashboard /> },
  { path: "/admission", element: <AdmissionProcess /> },
  { path: "/admission/edit/:id", element: <AdmissionEditPage /> },
  { path: "/admission-record", element: <AdmissionRecords /> },
  { path: "/interview-detail/:id", element: <AdmissionInterviewDetails /> },

  { path: "/student-dashboard", element: <StudentDashboard /> },
  { path: "/student-detail-table", element: <StudentDetailTable /> },
  { path: "/student/edit/:id", element: <StudentEditPage /> },
  { path: "/student/leveldata/:id", element: <StudentLevelData /> },
  { path: "/student-profile/:id", element: <StudentProfile /> },
  { path: "/student-permission", element: <StudentPermission /> },

  { path: "/readiness-status", element: <PlacementReadyStudents /> },
  { path: "/placement-interview-record", element: <PlacementRecords /> },
  { path: "/placement-post", element: <PlacementPost /> },
];

const Dashboard = () => (
  <Routes>
    {routes.map(({ path, element }, index) => (
      <Route key={index} path={path} element={element} />
    ))}
  </Routes>
);

export default Dashboard;

// import { Routes, Route } from "react-router-dom";
// import AdmissionProcess from "../admition-process/admition-process-page/AdmissionProcess";
// import StudentProfile from "../student-records/studentProfile/StudentProfile";
// import PlacementRecords from "../placement/placement-records/PlacementRecords";
// import AdmissionDashboard from "../admition-process/admission-dashboard/AdmissionDashboard";
// import AdmitionRecords from "../admition-process/admition-records/AdmitionRecords";
// import StudentEditPage from "../student-records/student-edit-page/StudentEditPage";
// import StudentDashboard from "../student-records/student-dashboard/StudentDashboard";
// import StudentDetailTable from "../student-records/student-detail-table/StudentDetailTable";
// import StudentPermission from "../student-records/student-permission/StudentPermission";
// import AdmissionEditPage from "../admition-process/admission-stu-edit-page/AdmissionEditPage";
// import AdmissionInterviewDetails from "../admition-process/admission-interview-detail/AdmissionInterviewDetails";

// const Dashboard = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<AdmissionDashboard />} />
//       <Route path="/admission" element={<AdmissionProcess />} />
//       <Route path="/admission/edit/:id" element={<AdmissionEditPage />} />
//       <Route path="/admition-record" element={<AdmitionRecords />} />
//       <Route path="/interview-detail/:id" element={<AdmissionInterviewDetails />} />
//       <Route path="/student-dashboard" element={<StudentDashboard />} />
//       <Route path="/student-permission" element={<StudentPermission />} />
//       <Route path="/student-detail-table" element={<StudentDetailTable />} />
//       <Route path="/student/edit/:id" element={<StudentEditPage />} />
//       <Route path="/placement" element={<PlacementRecords />} />
//       <Route path="/student-profile/:id" element={<StudentProfile />} />
//     </Routes>
//   );
// };

// export default Dashboard;
