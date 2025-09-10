import { Routes, Route } from "react-router-dom";
// Admission process components
import AdmissionDashboard from "../admition-process/AdmissionDashboard";
import AdmissionProcess from "../admition-process/AdmissionProcess";
import AdmissionEditPage from "../admition-process/AdmissionEditPage";

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
import PlacedStudents from "../placement/PlacedStudents";
import InterviewHistory from "../placement/InterviewHistory";
import InterviewRoundsHistory from "../placement/InterviewRoundsHistory";
import PageNotFound from "../common-components/error-pages/PageNotFound";
import ProtectedRoute from '../common-components/protected-route/ProtectedRoute';
import AttendanceDetails from "../dashboard/AttendanceDetails";

const Dashboard = () => {
  return (
    <Routes>
      {/* Dashboard Routes - All roles */}
      <Route path="/" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><AdmissionDashboard /></ProtectedRoute>} />
      <Route path="/attendance-details" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><AttendanceDetails /></ProtectedRoute>} />
      
      {/* Admin Only Routes */}
      <Route path="/admission-process" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><AdmissionProcess /></ProtectedRoute>} />
      <Route path="/admission/edit/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><AdmissionEditPage /></ProtectedRoute>} />
      
      {/* Student & Faculty Routes - All roles */}
      <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student-detail-table" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentDetailTable /></ProtectedRoute>} />
      <Route path="/student/edit/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentEditPage /></ProtectedRoute>} />
      <Route path="/student/leveldata/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentLevelData /></ProtectedRoute>} />
      <Route path="/student-profile/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/:studentId/level-interviews" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentLevelInterviewHistory /></ProtectedRoute>} />
      <Route path="/student-permission" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentPermission /></ProtectedRoute>} />
      
      {/* Placement Routes - All roles */}
      <Route path="/readiness-status" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacementReadyStudents /></ProtectedRoute>} />
      <Route path="/placement-interview-record" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacementRecords /></ProtectedRoute>} />
      <Route path="/company-details" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><CompanyDetail /></ProtectedRoute>} />
      <Route path="/placement/company/:companyId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacedStudents /></ProtectedRoute>} />
      <Route path="/placement-post" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacementPost /></ProtectedRoute>} />
      <Route path="/interview-history/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><InterviewHistory /></ProtectedRoute>} />
      <Route path="/interview-rounds-history/:studentId/:interviewId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><InterviewRoundsHistory /></ProtectedRoute>} />
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<PageNotFound />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default Dashboard;