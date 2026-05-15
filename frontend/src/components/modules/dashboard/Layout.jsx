import Sidebar from '../../shared/sidebar/Sidebar';
import { SidebarProvider } from '../../../contexts/SidebarContext';
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import StudentDetailTable from "../students/StudentDetailTable";
import DepartmentSelector from "../students/DepartmentSelector";
import StudentEditPage from "../students/StudentEditPage";
import StudentReport from "../students/StudentReport";
import StudentReportForm from "../students/StudentReportForm";
import StudentLevelData from "../students/StudentLevelData";
import StudentLevelInterviewHistory from "../students/StudentLevelInterviewHistory";
import PlacementReadyStudents from "../placements/PlacementReadyStudents";
import PlacementDashboard from "../placements/dashboard/PlacementDashboard";
import DepartmentPlacementDetail from "../placements/dashboard/DepartmentPlacementDetail";
import StudentPermission from "../students/StudentPermission";
import PlacementRecords from "../placements/PlacementRecords";
import PlacementPost from "../placements/PlacementPost";
import CompanyDetail from "../placements/CompanyDetail";
import PlacedStudents from "../placements/PlacedStudents";
import InterviewHistory from "../placements/InterviewHistory";
import InterviewRoundsHistory from "../placements/InterviewRoundsHistory";
import PageNotFound from "../../shared/error-pages/PageNotFound";
import ProtectedRoute from '../../shared/protected-route/ProtectedRoute';
import AttendanceDetails from "../attendance/AttendanceDetails";
import UsersManagement from "../users/UsersManagement";
import UserProfile from "../users/UserProfile";
import DepartmentManagement from "../settings/departments/DepartmentManagement";
import UserPermission from "../users/UserPermission";
import SubDepartment from "../settings/departments/SubDepartment";
import ShowLevels from "../settings/levels/ShowLevels";
import DepartmentDetails from "../settings/departments/DepartmentDetails";
import SubdepartmentDetails from "../settings/departments/SubdepartmentDetails";
import ShowSubLevelTablesData from "../settings/levels/ShowSubLevelTablesData";
import SubLevelManagement from "../settings/levels/SubLevelManagement";
import StudentProfilePage from "../settings/levels/StudentProfilePage";
import StudentTaskBoard from "../settings/levels/StudentTaskBoard";
import TaskManagement from "../settings/tasks/TaskManagement";
import TaskList from "../students/TaskList";
import SettingFIle from "../settings/SettingFIle";
import Supportfile from "../settings/Supportfile";
import SessionManagement from "../settings/sessions/SessionManagement";
import CurriculumManagement from "../settings/curriculum/CurriculumManagement";

// admin/superadmin → DepartmentSelector, faculty → direct StudentDetailTable
const RoleBasedStudentPage = () => {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  if (role === "superadmin" || role === "admin") return <DepartmentSelector />;
  return <StudentDetailTable />;
};

const Layout = () => {
    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <Sidebar>
                <Routes>
                    <Route path="/" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/attendance-details" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><AttendanceDetails /></ProtectedRoute>} />
                    <Route path="/user-management" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><UsersManagement /></ProtectedRoute>} />
                    <Route path="/user-profile/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><UserProfile /></ProtectedRoute>} />
                    <Route path="/student/edit/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentEditPage /></ProtectedRoute>} />
                    <Route path="/student-detail-table" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><RoleBasedStudentPage /></ProtectedRoute>} />
                    <Route path="/student-detail-table/:subDepartmentId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentDetailTable /></ProtectedRoute>} />
                    <Route path="/student/leveldata/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentLevelData /></ProtectedRoute>} />
                    <Route path="/student-profile/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentProfilePage /></ProtectedRoute>} />
                    <Route path="/student/:id/report/edit" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentReportForm /></ProtectedRoute>} />
                    <Route path="/student/:id/report" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentReport /></ProtectedRoute>} />
                    <Route path="/student-level-interviews/:studentId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentLevelInterviewHistory /></ProtectedRoute>} />
                    <Route path="/student/:id/task-list" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><TaskList /></ProtectedRoute>} />
                    <Route path="/student-permission" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentPermission /></ProtectedRoute>} />
                    <Route path="/readiness-status" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacementReadyStudents /></ProtectedRoute>} />
                    <Route path="/placements/dashboard" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><PlacementDashboard /></ProtectedRoute>} />
                    <Route path="/placements/department/:subDepartmentId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><DepartmentPlacementDetail /></ProtectedRoute>} />
                    <Route path="/placement-interview-record" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacementRecords /></ProtectedRoute>} />
                    <Route path="/company-details" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><CompanyDetail /></ProtectedRoute>} />
                    <Route path="/placement/company/:companyId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacedStudents /></ProtectedRoute>} />
                    <Route path="/placement-post" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><PlacementPost /></ProtectedRoute>} />
                    <Route path="/interview-history/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><InterviewHistory /></ProtectedRoute>} />
                    <Route path="/interview-rounds-history/:studentId/:interviewId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><InterviewRoundsHistory /></ProtectedRoute>} />
                    <Route path="/department-management" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><DepartmentManagement /></ProtectedRoute>} />
                    <Route path="/department-details/:id" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><DepartmentDetails /></ProtectedRoute>} />
                    <Route path="/subdepartment/:id/levels" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><SubdepartmentDetails /></ProtectedRoute>} />
                    <Route path="/subdepartment/:id/level/:levelId" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><SubLevelManagement /></ProtectedRoute>} />
                    <Route path="/subdepartment-details" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><SubdepartmentDetails /></ProtectedRoute>} />
                    <Route path="/show-sublevel-tables" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><ShowSubLevelTablesData /></ProtectedRoute>} />
                    <Route path="/setting/student-profile" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentProfilePage /></ProtectedRoute>} />
                    <Route path="/student/task-board" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><StudentTaskBoard /></ProtectedRoute>} />
                    <Route path="/task-management" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><TaskManagement /></ProtectedRoute>} />
                    <Route path="/subdepartments" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><SubDepartment /></ProtectedRoute>} />
                    <Route path="/levels" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><ShowLevels /></ProtectedRoute>} />
                    <Route path="/user-permission" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><UserPermission /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><SettingFIle /></ProtectedRoute>} />
                    <Route path="/support" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><Supportfile /></ProtectedRoute>} />
                    <Route path="/curriculum-management" element={<ProtectedRoute allowedRoles={["superadmin", "admin", "faculty"]}><CurriculumManagement /></ProtectedRoute>} />
                    <Route path="/session-management" element={<ProtectedRoute allowedRoles={["superadmin", "admin"]}><SessionManagement /></ProtectedRoute>} />
                    <Route path="/unauthorized" element={<PageNotFound />} />
                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </Sidebar>
            </SidebarProvider>
        </div>
    );
};

export default Layout;
