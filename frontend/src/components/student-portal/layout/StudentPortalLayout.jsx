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
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-50">
        <img src={logo} alt="Logo" className="h-9 w-auto" />
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Portal</p>
          <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight truncate">SSISM IT-Cell</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 group ${
                isActive
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
                <>
                    <Icon size={18} className={`${isActive ? "text-white" : "text-slate-400"}`} />
                    {label}
                </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-8 pt-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 shadow-sm z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-[110] w-64 h-full animate-slide-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600 p-2 hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Management System</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <img src={logo} alt="SSISM Logo" className="h-9 sm:h-11 w-auto" />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
