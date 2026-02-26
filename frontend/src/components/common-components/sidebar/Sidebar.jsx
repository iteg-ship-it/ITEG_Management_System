import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { MdWork, MdDashboard } from "react-icons/md";
import { RiTv2Fill } from "react-icons/ri";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import { IoSettingsSharp } from "react-icons/io5";
import Header from "./Header";
import UserProfile from "../user-profile/UserProfile";

const Sidebar = ({ children }) => {
<<<<<<< HEAD
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);
=======
  // Simple permission check based on role
  const role = (localStorage.getItem("role") || "").toLowerCase();
  const hasPermission = (permission, action = 'view') => {
    // For now, allow all permissions for all roles
    // You can implement proper permission logic later
    return true;
  };
  const [isOpen, setIsOpen] = useState(() => {
    // Check if screen is large (lg breakpoint is 1024px)
    return window.innerWidth >= 1024;
  });
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const location = useLocation();

  const [openMenus, setOpenMenus] = useState(() => {
    const path = location.pathname;
<<<<<<< HEAD
    const initialMenus = [];
    
    if (path === "/" || path === "/attendance-details") initialMenus.push(0);
    if (path === "/admission-process" || path.startsWith("/admission/")) initialMenus.push(1);
    if (path === "/student-dashboard" || path === "/student-detail-table" || path === "/student-permission" || path.startsWith("/student-profile/")) initialMenus.push(2);
    if (path === "/readiness-status" || path === "/company-details" || path === "/placement-post" || path.startsWith("/interview-history/") || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) initialMenus.push(3);
    if (path === "/department-management" || path === "/subdepartments" || path === "/levels" || path === "/user-management" || path === "/user-permission" || path.startsWith("/department-details/") || path === "/subdepartment-details") initialMenus.push(4);
    
    return initialMenus.length > 0 ? initialMenus : [0];
=======
    const openMenus = [];

    // Dashboard menu (index 0)
    if (path === "/") {
      openMenus.push(0);
    }
    // Admissions menu (index 1)
    if (path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") {
      openMenus.push(1);
    }
    // Admitted menu (index 2)
    if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/") || path === "/level-wise-management") {
      openMenus.push(2);
    }
    // Placements menu (index 3)
    if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
      openMenus.push(3);
    }
    // User Management menu (index 4)
    if (path === "/users-management" || path.startsWith("/user-profile/")) {
      openMenus.push(4);
    }
    if (path.startsWith("/student-profile/")) {
      const lastSection = localStorage.getItem("lastSection");
      openMenus.push(lastSection === "admission" ? 1 : 2);
    }

    return openMenus.length > 0 ? openMenus : [0, 1, 2, 3];
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
  });

  useEffect(() => {
    const path = location.pathname;
<<<<<<< HEAD
    const newMenus = [];
    
    if (path === "/" || path === "/attendance-details") newMenus.push(0);
    if (path === "/admission-process" || path.startsWith("/admission/")) newMenus.push(1);
    if (path === "/student-dashboard" || path === "/student-detail-table" || path === "/student-permission" || path.startsWith("/student-profile/")) newMenus.push(2);
    if (path === "/readiness-status" || path === "/company-details" || path === "/placement-post" || path.startsWith("/interview-history/") || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) newMenus.push(3);
    if (path === "/department-management" || path === "/subdepartments" || path === "/levels" || path === "/user-management" || path === "/user-permission" || path.startsWith("/department-details/") || path === "/subdepartment-details") newMenus.push(4);
    
    if (newMenus.length > 0) {
      setOpenMenus(prev => {
        if (JSON.stringify(prev.sort()) !== JSON.stringify(newMenus.sort())) {
          return newMenus;
        }
        return prev;
      });
=======
    const newOpenMenus = [];

    // Dashboard menu (index 0)


    // Admissions menu (index 1)
    if (path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") {
      newOpenMenus.push(1);
      localStorage.setItem("lastSection", "admission");
    }
    // Admitted menu (index 2)
    if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/") || path === "/level-wise-management") {
      newOpenMenus.push(2);
      localStorage.setItem("lastSection", "admitted");
    }
    // Placements menu (index 3)
    if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
      newOpenMenus.push(3);
    }
    // User Management menu (index 4)
    if (path === "/users-management" || path.startsWith("/user-profile/")) {
      newOpenMenus.push(4);
    }
    if (path.startsWith("/student-profile/")) {
      const lastSection = localStorage.getItem("lastSection");
      newOpenMenus.push(lastSection === "admission" ? 1 : 2);
    }

    if (newOpenMenus.length > 0) {
      setOpenMenus((prev) => [...new Set([...prev, ...newOpenMenus])]);
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
    }
  }, [location.pathname]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isSubMenuActive = (subPath) => {
    const path = location.pathname;

    if (subPath === "/") return path === "/";
    if (subPath === "/attendance-details") return path === "/attendance-details";

    if (subPath === "/admission-process") {
      return (
        path === "/admission-process" ||
        path.startsWith("/admission/") ||
        path.startsWith("/interview-detail/") ||
        path === "/admission-record"
      );
    }

    if (subPath === "/student-dashboard") {
<<<<<<< HEAD
      return (
        path === "/student-dashboard" ||
        path === "/student-detail-table" ||
        path.startsWith("/student-profile/")
      );
=======
      return path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student-profile/") || path.includes("/level-interviews") || path.includes("/task-list");
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
    }

    if (subPath === "/student-permission") return path === "/student-permission";

    if (subPath === "/readiness-status") {
      return (
        path === "/readiness-status" ||
        path.startsWith("/interview-history/") ||
        path.startsWith("/interview-rounds-history/")
      );
    }

    if (subPath === "/company-details") {
      return path === "/company-details" || path.startsWith("/placement/");
    }

    if (subPath === "/placement-post") return path === "/placement-post";

    if (subPath === "/users-management") {
      return path === "/users-management" || path.startsWith("/user-profile/");
    }

    return path === subPath || path.startsWith(subPath + "/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      permission: 'dashboard',
      subMenu: [
        { name: "Dashboard", path: "/", permission: 'dashboard' },
        { name: "Attendance Details", path: "/attendance-details", permission: 'attendanceDetails' },
      ],
    },
    {
      name: "Admissions",
      icon: <RiTv2Fill />,
<<<<<<< HEAD
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [{ name: "Admission Workflow", path: "/admission-process" }],
=======
      permission: 'admissionProcess',
      subMenu: [
        { name: "Admission Workflow", path: "/admission-process", permission: 'admissionProcess' },
      ],
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
    },
    {
      name: "Admitted",
      icon: <FaClipboardList />,
      permission: 'studentDashboard',
      subMenu: [
        { name: "Student Progress", path: "/student-dashboard", permission: 'studentDashboard' },
        { name: "Level-wise Management", path: "/level-wise-management", permission: 'studentDashboard' },
        { name: "Dummy Students", path: "/student-permission", permission: 'studentPermission' },
      ],
    },
    {
      name: "Placements",
      icon: <MdWork />,
      permission: 'placementReadyStudents',
      subMenu: [
        { name: "Placement Candidates", path: "/readiness-status", permission: 'placementReadyStudents' },
        { name: "Company Details", path: "/company-details", permission: 'companyDetail' },
        { name: "Placed Students", path: "/placement-post", permission: 'placementPost' },
      ],
    },
    {
      name: "User Management",
      icon: <FaUserGroup />,
      permission: 'usersManagement',
      subMenu: [
        { name: "Users", path: "/users-management", permission: 'usersManagement' },
      ],
    },
    {
      name: "Settings",
      icon: <IoSettingsSharp />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Department Management", path: "/department-management" },
        { name: "Subdepartments", path: "/subdepartments" },
        { name: "Levels", path: "/levels" },
        { name: "User Management", path: "/user-management" },
        { name: "User Permission", path: "/user-permission" },
      ],
    },
  ];

  return (
    <>
      <Header sidebarOpen={isOpen} />

      <div className="flex">
        <aside
          className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 bg-white border-r border-gray-200 ${
            isOpen ? "w-64" : "w-16"
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-5">
            <div className="bg-orange-400 text-white p-2 rounded-lg">🎓</div>

            {isOpen && (
              <div>
                <h1 className="font-semibold text-gray-800 leading-none">
                  EduManager
                </h1>
                <p className="text-xs text-gray-500">Admin Console</p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-auto text-xl text-gray-600"
            >
              <IoMenu />
            </button>
          </div>

          {isOpen && (
            <nav className="px-2 py-3 overflow-y-auto h-[calc(100vh-180px)]">
              {menuItems.slice(0, 4).map((item, idx) => {
                if (!item.roles.includes(role)) return null;

<<<<<<< HEAD
=======
        {/* Sidebar links */}
        {isOpen && (
          <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto">
            {menuItems
              .filter((item) => hasPermission(item.permission, 'view'))
              .map((item, idx) => {
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
                const isActive = openMenus.includes(idx);

                return (
                  <div key={idx} className="mb-1">
                    <div
                      onClick={() => toggleMenu(idx)}
                      className={`group flex items-center justify-between px-2 py-2.5 rounded-lg cursor-pointer transition border-l-4 ${
                        isActive
                          ? "bg-orange-100 text-orange-400 font-semibold border-orange-500"
                          : "text-gray-700 hover:bg-gray-100 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-[15px]">
                        {item.icon}
                        {item.name}
                      </div>
                      <span className={`${isActive ? 'block' : 'hidden group-hover:block'}`}>
                        {isActive ? <HiChevronUp /> : <HiChevronDown />}
                      </span>
                    </div>

                    {isActive && (
<<<<<<< HEAD
                      <div className="mt-1 space-y-1">
                        {item.subMenu.map((sub, i) => {
=======
                      <div className="ml-1">
                        {item.subMenu
                          .filter((sub) => hasPermission(sub.permission, 'view'))
                          .map((sub, i) => {
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc
                          const active = isSubMenuActive(sub.path);
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={`block ml-6 rounded-lg px-2 py-2 text-sm transition border-l-4 ${
                                active
                                  ? "bg-orange-50 text-orange-400 font-medium border-orange-500"
                                  : "text-gray-600 hover:bg-gray-100 border-transparent"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
<<<<<<< HEAD
=======
          </nav>
        )}


      </aside>
>>>>>>> 96de5e9bb9348035916b62d65a6884ab7ebca2fc

              <p className="text-xs text-gray-400 px-3 mt-4 mb-2">SYSTEM</p>
              {menuItems.slice(4).map((item, idx) => {
                if (!item.roles.includes(role)) return null;
                const settingsIdx = 4;
                const isActive = openMenus.includes(settingsIdx);

                return (
                  <div key={idx} className="mb-1">
                    <div
                      onClick={() => toggleMenu(settingsIdx)}
                      className={`group flex items-center justify-between px-2 py-2.5 rounded-lg cursor-pointer transition border-l-4 ${
                        isActive
                          ? "bg-orange-100 text-orange-400 font-semibold border-orange-500"
                          : "text-gray-700 hover:bg-gray-100 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-[15px]">
                        {item.icon}
                        {item.name}
                      </div>
                      <span className={`${isActive ? 'block' : 'hidden group-hover:block'}`}>
                        {isActive ? <HiChevronUp /> : <HiChevronDown />}
                      </span>
                    </div>

                    {isActive && (
                      <div className="mt-1 space-y-1">
                        {item.subMenu.map((sub, i) => {
                          const active = isSubMenuActive(sub.path);
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={`block ml-6 rounded-lg px-2 py-2 text-sm transition border-l-4 ${
                                active
                                  ? "bg-orange-50 text-orange-400 font-medium border-orange-500"
                                  : "text-gray-600 hover:bg-gray-100 border-transparent"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {isOpen && (
            <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50">
              <UserProfile />
            </div>
          )}
        </aside>

        <main
          className={`flex-1 pt-20 px-4 transition-all duration-300 bg-[#F8F7F5] min-h-screen ${
            isOpen ? "ml-64" : "ml-16"
          }`}
        >
          {children}
        </main>
      </div>
    </>
  );
};

export default Sidebar;
