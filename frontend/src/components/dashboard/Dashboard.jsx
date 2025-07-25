import { Routes, Route } from "react-router-dom";

// Admission process components
// import AdmissionDashboard from "../admition-process/AdmissionDashboard";
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
import StudentLevelInterviewHistory from "../student-records/StudentLevelInterviewHistory";
// Placement components
import PlacementReadyStudents from "../placement/PlacementReadyStudents";
import StudentPermission from "../student-records/StudentPermission";
import PlacementRecords from "../placement/PlacementRecords";
import PlacementPost from "../placement/PlacementPost";

const routes = [
  // { path: "/", element: <AdmissionDashboard /> },
  { path: "/", element: <AdmissionProcess /> },
  { path: "/admission/edit/:id", element: <AdmissionEditPage /> },
  { path: "/admission-record", element: <AdmissionRecords /> },
  { path: "/interview-detail/:id", element: <AdmissionInterviewDetails /> },

  { path: "/student-dashboard", element: <StudentDashboard /> },
  { path: "/student-detail-table", element: <StudentDetailTable /> },
  { path: "/student/edit/:id", element: <StudentEditPage /> },
  { path: "/student/leveldata/:id", element: <StudentLevelData /> },
  { path: "/student-profile/:id", element: <StudentProfile /> },
  { path: "/student/:studentId/level-interviews", element: <StudentLevelInterviewHistory /> },
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