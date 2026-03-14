/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoSettingsSharp } from "react-icons/io5";
import { FaClipboardList , FaUserGroup} from "react-icons/fa6";
import { MdWork, MdDashboard } from "react-icons/md";
import { RiTv2Fill } from "react-icons/ri";
import { HiChevronUp, HiChevronDown, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import UserProfile from "../user-profile/UserProfile";
import { usePermissions } from "../../../hooks/usePermissions";
import logo from "../../../assets/images/logo.png";
import logoo from "../../../assets/images/logo-ssism.png";

const Sidebar = ({ children }) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();

  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const role = (localStorage.getItem("role") || "").toLowerCase();

  const getActiveMenus = (path) => {
    if (path === "/" || path === "/attendance-details") return [0];
    if (path === "/admission-process" || path.startsWith("/admission/")) return [1];
    if (path === "/student-dashboard" || path === "/student-detail-table" || path === "/student-permission" || path.startsWith("/student-profile/") || path === "/department-management" || path.startsWith("/department-details/") || path === "/subdepartment-details" || path === "/task-management") return [2];
    if (path === "/readiness-status" || path === "/company-details" || path === "/placement-post" || path.startsWith("/interview-history/") || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) return [3];
    if (path === "/user-management" || path.startsWith("/user-profile/") || path === "/user-permission") return [4];
    return [0];
  };

  const [openMenus, setOpenMenus] = useState(() => getActiveMenus(location.pathname));

  useEffect(() => {
    const newMenus = getActiveMenus(location.pathname);
    setOpenMenus(newMenus);
  }, [location.pathname]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [index]
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

    if (subPath === "/department-management") {
      return (
        path === "/department-management" ||
        path.startsWith("/department-details/") ||
        path === "/subdepartment-details"
      );
    }

    if (subPath === "/task-management") return path === "/task-management";

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
      permission: "Page_Dashboard", // Example permission
      subMenu: [
        { name: "Dashboard", path: "/", permission: "Page_Dashboard" },
        { name: "Attendance Details", path: "/attendance-details", permission: "Page_AttendanceDetails" },
      ],
    },
    {
      name: "Admissions",
      icon: <RiTv2Fill />,
      permission: "Page_Admission",
      subMenu: [
        { name: "Admission Workflow", path: "/admission-process", permission: "Page_Admission" },
      ],
    },
    {
      name: "Academics",
      icon: <FaClipboardList />,
      permission: "Page_AdmittedStudents",
      subMenu: [
        { name: "Student Progress", path: "/student-dashboard", permission: "Page_AdmittedStudents" },
        { name: "Level-wise Management", path: "/level-wise-management", permission: "Page_LevelWiseManagement" },
        { name: "Dummy Students", path: "/student-permission", permission: "Page_DummyStudents" },
      ],
    },
    {
      name: "Placements",
      icon: <MdWork />,
      permission: "Page_Placement",
      subMenu: [
        { name: "Placement Candidates", path: "/readiness-status", permission: "Page_Placement" },
        { name: "Company Details", path: "/company-details", permission: "Page_CompanyDetails" },
        { name: "Placed Students", path: "/placement-post", permission: "Page_PlacedStudents" },
      ],
    },
    {
      name: "User Management",
      icon: <FaUserGroup />,
      permission: "Page_UserManagement",
      subMenu: [
        { name: "Users", path: "/user-management", permission: "Page_UserManagement" },
      ],
    },
  ];

  const systemMenuItems = [
    {
      name: "Settings",
      icon: <IoSettingsSharp />,
      permission: "Page_Settings",
      subMenu: [
        { name: "Department Management", path: "/department-management", permission: "Page_Department" },
        { name: "Subdepartments", path: "/subdepartments", permission: "Page_SubDepartment" },
        { name: "Levels", path: "/levels", permission: "Page_Level" },
        { name: "User Permission", path: "/user-permission", permission: "Page_GlobalPermissionMatrix" },
      ],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission, 'read'));

  const anyPermissionsLoaded = filteredMenuItems.length > 0;

  return (
    <>
      {/* <Header sidebarOpen={isOpen} /> */}

      <div className="flex">
        <aside
          className={`fixed top-0 left-0 z-20 h-screen transition-all duration-300 bg-white border-r border-gray-200 ${
            isOpen ? "w-64" : "w-16"
          }`}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-10 h-10 bg-white text-gray-600 rounded-full shadow-md hover:shadow-lg border border-gray-200 transition-all duration-300 flex items-center justify-center z-10"
          >
            {isOpen ? <HiChevronLeft size={20} /> : <HiChevronRight size={20} />}
          </button>
          
          <div className="flex items-center gap-3 px-4 py-5">
            {isOpen ? (
              <img src={logo} alt="Logo" className="h-20 w-auto" />
            ) : (
              <img src={logoo} alt="Logo" className="h-8 w-auto" />
            )}
          </div>

          {isOpen && (
            <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto h-[calc(100vh-180px)]">
              {(anyPermissionsLoaded ? filteredMenuItems : menuItems).map((item, idx) => {
                  const filteredSubMenu = anyPermissionsLoaded
                    ? item.subMenu.filter(subItem => hasPermission(subItem.permission, 'read'))
                    : item.subMenu;

                  if (filteredSubMenu.length === 0) {
                    return null; // Do not render main menu if no sub-items are accessible
                  }

                const isActive = openMenus.includes(idx);

                return (
                  <div key={idx} className="mb-1">
                    <div
                      onClick={() => toggleMenu(idx)}
                      className={`flex items-center justify-between px-2 py-2.5 rounded-lg cursor-pointer transition ${
                        isActive
                          ? "bg-orange-100 text-orange-400 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-[15px]">
                        {item.icon}
                        {item.name}
                      </div>
                      {isActive ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                    </div>

                    {isActive && (
                      <div className="mt-1">
                        {filteredSubMenu.map((sub, i) => {
                          const active = isSubMenuActive(sub.path);
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={`block ml-6 px-2 py-2 text-sm transition border-l-2 ${
                                active
                                  ? "bg-orange-50 text-orange-400 font-medium border-orange-500"
                                  : "text-gray-600 hover:bg-gray-100 border-gray-300"
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
              {systemMenuItems.map((item, idx) => {
                const filteredSystemSub = anyPermissionsLoaded
                  ? item.subMenu.filter(subItem => hasPermission(subItem.permission, 'read'))
                  : item.subMenu;
                if (filteredSystemSub.length === 0) return null;
                const sysIdx = menuItems.length + idx;
                const isActive = openMenus.includes(sysIdx);
                return (
                  <div key={idx} className="mb-1">
                    <div
                      onClick={() => toggleMenu(sysIdx)}
                      className={`flex items-center justify-between px-2 py-2.5 rounded-lg cursor-pointer transition ${
                        isActive
                          ? "bg-orange-100 text-orange-400 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-[15px]">
                        {item.icon}
                        {item.name}
                      </div>
                      {isActive ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                    </div>
                    {isActive && (
                      <div className="mt-1">
                        {filteredSystemSub.map((sub, i) => {
                          const active = isSubMenuActive(sub.path);
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={`block ml-6 px-2 py-2 text-sm transition border-l-2 ${
                                active
                                  ? "bg-orange-50 text-orange-400 font-medium border-orange-500"
                                  : "text-gray-600 hover:bg-gray-100 border-gray-300"
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
