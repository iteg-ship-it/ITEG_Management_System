import { Routes, Route, Navigate } from "react-router-dom";
// Admission process components
// import AdmissionDashboard from "../admition-process/AdmissionDashboard";
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
import StudentLevelInterviewHistory from "../student-records/StudentLevelInterviewHistory";
// Placement components
import PlacementReadyStudents from "../placement/PlacementReadyStudents";
import StudentPermission from "../student-records/StudentPermission";
import PlacementRecords from "../placement/PlacementRecords";
import PlacementPost from "../placement/PlacementPost";
import CompanyDetail from "../placement/CompanyDetail";
import InterviewHistory from "../placement/InterviewHistory";
import InterviewRoundsHistory from "../placement/InterviewRoundsHistory";
import PageNotFound from "../common-components/error-pages/PageNotFound";
import ProtectedRoute from '../common-components/protected-route/ProtectedRoute';

// Role-based route configuration
const adminRoutes = [
  { path: "/", element: <AdmissionDashboard />, roles: ["superadmin", "admin"] },
  { path: "/admission-process", element: <AdmissionProcess />, roles: ["superadmin", "admin"] },
  { path: "/admission/edit/:id", element: <AdmissionEditPage />, roles: ["superadmin", "admin"] },
  { path: "/admission-record", element: <AdmissionRecords />, roles: ["superadmin", "admin"] },
  { path: "/interview-detail/:id", element: <AdmissionInterviewDetails />, roles: ["superadmin", "admin"] },
];

const facultyRoutes = [
  { path: "/student-dashboard", element: <StudentDashboard />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/student-detail-table", element: <StudentDetailTable />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/student/edit/:id", element: <StudentEditPage />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/student/leveldata/:id", element: <StudentLevelData />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/student-profile/:id", element: <StudentProfile />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/student/:studentId/level-interviews", element: <StudentLevelInterviewHistory />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/student-permission", element: <StudentPermission />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/readiness-status", element: <PlacementReadyStudents />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/placement-interview-record", element: <PlacementRecords />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/company-details", element: <CompanyDetail />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/placement-post", element: <PlacementPost />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/interview-history/:id", element: <InterviewHistory />, roles: ["superadmin", "admin", "faculty"] },
  { path: "/interview-rounds-history/:studentId/:interviewId", element: <InterviewRoundsHistory />, roles: ["superadmin", "admin", "faculty"] },
];

const allRoutes = [...adminRoutes, ...facultyRoutes];

const Dashboard = () => {
  const userRole = localStorage.getItem('role');
  
  return (
    <Routes>
      {/* Redirect faculty from root to student dashboard */}
      <Route 
        path="/" 
        element={
          userRole === 'faculty' ? 
          <Navigate to="/student-dashboard" replace /> : 
          <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
            <AdmissionDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected routes */}
      {allRoutes.map(({ path, element, roles }, index) => (
        <Route 
          key={index} 
          path={path} 
          element={
            <ProtectedRoute allowedRoles={roles}>
              {element}
            </ProtectedRoute>
          } 
        />
      ))}
      
      {/* Catch-all route for invalid paths when logged in */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default Dashboard;