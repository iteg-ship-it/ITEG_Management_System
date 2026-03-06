/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { MdWork, MdDashboard } from "react-icons/md";
import { RiTv2Fill } from "react-icons/ri";
import { HiChevronUp, HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import UserProfile from "../user-profile/UserProfile";
import logo from '../../../assets/images/logo.png';
import logoo from '../../../assets/images/logo-ssism.png';

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const location = useLocation();
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [openMenus, setOpenMenus] = useState(() => {
    const path = location.pathname;
    const initialMenus = [];
    
    if (path === "/" || path === "/attendance-details") initialMenus.push(0);
    if (path === "/admission-process" || path.startsWith("/admission/")) initialMenus.push(1);
    if (path === "/student-dashboard" || path === "/student-detail-table" || path === "/student-permission" || path.startsWith("/student-profile/")) initialMenus.push(2);
    if (path === "/readiness-status" || path === "/company-details" || path === "/placement-post" || path.startsWith("/interview-history/") || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) initialMenus.push(3);
    if (path === "/department-management" || path === "/subdepartments" || path === "/levels" || path === "/user-management" || path === "/user-permission" || path.startsWith("/department-details/") || path === "/subdepartment-details") initialMenus.push(4);
    
    return initialMenus.length > 0 ? initialMenus : [0];
  });

  useEffect(() => {
    const path = location.pathname;
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
      return (
        path === "/student-dashboard" ||
        path === "/student-detail-table" ||
        path.startsWith("/student-profile/")
      );
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

    return path === subPath || path.startsWith(subPath + "/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Dashboard", path: "/" },
        { name: "Attendance Details", path: "/attendance-details" },
      ],
    },
    {
      name: "Admissions",
      icon: <RiTv2Fill />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [{ name: "Admission Workflow", path: "/admission-process" }],
    },
    {
      name: "Admitted",
      icon: <FaClipboardList />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Student Progress", path: "/student-dashboard" },
        // { name: "Level-wise Management", path: "/level-wise-management" },
        { name: "Dummy Students", path: "/student-permission" },
      ],
    },
    {
      name: "Placements",
      icon: <MdWork />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Placement Candidates", path: "/readiness-status" },
        { name: "Company Details", path: "/company-details" },
        { name: "Placed Students", path: "/placement-post" },
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
          {/* Toggle Button - Mid Sidebar */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-8 h-8 bg-white text-gray-600 rounded-full shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 flex items-center justify-center z-40"
          >
            {isOpen ? <HiChevronLeft size={16} /> : <HiChevronRight size={16} />}
          </button>
          {/* BRAND */}
          <div className="flex items-center gap-3 px-4 py-5">
            {isOpen ? (
              <img src={logo} alt="Logo" className="h-20 w-auto" />
            ) : (
              <img src={logoo} alt="Logo" className="h-8 w-auto" />
            )}
          </div>

          {isOpen && (
            <nav className="px-2 py-3 overflow-y-auto h-[calc(100vh-180px)]">
              {menuItems.slice(0, 4).map((item, idx) => {
                if (!item.roles.includes(role)) return null;

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
          className={`flex-1 bg-[#F8F7F5] min-h-screen transition-all duration-300 ${
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
