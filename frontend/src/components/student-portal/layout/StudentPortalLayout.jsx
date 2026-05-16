import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, TrendingUp, User, LogOut, Menu, X, ShieldCheck, FolderOpen, Award, FileText } from "lucide-react";
import { toast } from "react-toastify";
import logo from "../../../assets/images/logo-ssism.png";

const navItems = [
  { to: "/student-portal/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/student-portal/tasks", icon: ClipboardList, label: "My Tasks" },
  { to: "/student-portal/progress", icon: TrendingUp, label: "Level History" },
  { to: "/student-portal/permissions", icon: ShieldCheck, label: "Permissions" },
  { to: "/student-portal/documents", icon: FolderOpen, label: "Documents" },
  { to: "/student-portal/placement", icon: Award, label: "Placement" },
  { to: "/student-portal/report-card", icon: FileText, label: "Report Card" },
  { to: "/student-portal/profile", icon: User, label: "My Profile" },
];

export default function StudentPortalLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentRefreshToken");
    localStorage.removeItem("studentData");
    localStorage.removeItem("role");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-orange-100">
        <img src={logo} alt="Logo" className="h-10" />
        <div>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Student Portal</p>
          <p className="text-xs text-gray-500 truncate max-w-[130px]">
            {studentData.firstName} {studentData.lastName}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-56 h-full bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between md:justify-end shrink-0">
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            {studentData.image ? (
              <img src={studentData.image} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                {studentData.firstName?.[0]}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {studentData.firstName} {studentData.lastName}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
