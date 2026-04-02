import { Routes, Route } from "react-router-dom";
import { usePermissions } from '../contexts/PermissionContext';
// Admission process components
import AdmissionDashboard from "../admition-process/AdmissionDashboard";
import AdmissionProcess from "../admition-process/AdmissionProcess";
import AdmissionEditPage from "../admition-process/AdmissionEditPage";

// Student records components
import StudentDetailTable from "../student-records/StudentDetailTable";
import StudentEditPage from "../student-records/StudentEditPage";
import StudentProfile from "../student-records/StudentProfile";
import StudentReport from "../student-records/StudentReport";
import StudentReportForm from "../student-records/StudentReportForm";
import StudentLevelData from "../student-records/StudentLevelData";
import StudentLevelInterviewHistory from "../student-records/StudentLevelInterviewHistory";
import TaskList from "../student-records/TaskList";
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
import AttendanceDetails from "./AttendanceDetails";
import UsersManagement from "../user-management/UsersManagement";
import UserProfile from "../user-management/UserProfile";
import DepartmentManagement from "../Setting/Departments/DepartmentManagement";
import UserPermission from "../user-management/UserPermission";
import SubDepartment from "../Setting/Departments/SubDepartment";
import ShowLevels from "../Setting/Levels/ShowLevels";
import DepartmentDetails from "../Setting/Departments/DepartmentDetails";
import SubdepartmentDetails from "../Setting/Departments/SubdepartmentDetails";
import Header from "../common-components/sidebar/Header";

const Dashboard = () => {
  const { hasPermission } = usePermissions();
  
  return (
    <Routes>
      {/* Dashboard Routes - Permission based */}
      {hasPermission('Page_Dashboard') && (
        <Route path="/" element={<AdmissionDashboard />} />
      )}
      {hasPermission('Page_AttendanceDetails') && (
        <Route path="/attendance-details" element={<AttendanceDetails />} />
      )}
      
      {/* User Management - Superadmin only */}
      {hasPermission('Page_UserManagement') && (
        <>
          <Route path="/user-management" element={<UsersManagement />} />
          <Route path="/user-profile/:id" element={<UserProfile />} />
          <Route path="/user-permission" element={<UserPermission />} />
        </>
      )}
      
      {/* Admission Routes - Permission based */}
      {hasPermission('Page_Admission') && (
        <>
          <Route path="/admission-process" element={<AdmissionProcess />} />
          <Route path="/admission/edit/:id" element={<AdmissionEditPage />} />
        </>
      )}
      
      {/* Student Routes - Permission based */}
      {hasPermission('Page_AdmittedStudents') && (
        <>
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-detail-table" element={<StudentDetailTable />} />
          <Route path="/student/edit/:id" element={<StudentEditPage />} />
          <Route path="/student/leveldata/:id" element={<StudentLevelData />} />
          <Route path="/student-profile/:id" element={<StudentProfile />} />
          <Route path="/student/:id/report/edit" element={<StudentReportForm />} />
          <Route path="/student/:id/report" element={<StudentReport />} />
          <Route path="/student/:studentId/level-interviews" element={<StudentLevelInterviewHistory />} />
          <Route path="/student/:id/task-list" element={<TaskList />} />
          <Route path="/student-permission" element={<StudentPermission />} />
        </>
      )}
      
      {/* Placement Routes - Permission based */}
      {hasPermission('Page_Placement') && (
        <>
          <Route path="/readiness-status" element={<PlacementReadyStudents />} />
          <Route path="/placement-interview-record" element={<PlacementRecords />} />
          <Route path="/placement-post" element={<PlacementPost />} />
          <Route path="/interview-history/:id" element={<InterviewHistory />} />
          <Route path="/interview-rounds-history/:studentId/:interviewId" element={<InterviewRoundsHistory />} />
        </>
      )}
      
      {hasPermission('Page_CompanyDetails') && (
        <>
          <Route path="/company-details" element={<CompanyDetail />} />
          <Route path="/placement/company/:companyId" element={<PlacedStudents />} />
        </>
      )}
      
      {/* Settings Routes - Permission based */}
      {hasPermission('Page_Department') && (
        <>
          <Route path="/department-management" element={<DepartmentManagement />} />
          <Route path="/department-details/:id" element={<DepartmentDetails />} />
        </>
      )}
      
      {hasPermission('Page_SubDepartment') && (
        <>
          <Route path="/subdepartment-details" element={<SubdepartmentDetails />} />
          <Route path="/subdepartments" element={<SubDepartment />} />
        </>
      )}
      
      {hasPermission('Page_Level') && (
        <Route path="/levels" element={<ShowLevels />} />
      )}
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<PageNotFound />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default Dashboard;