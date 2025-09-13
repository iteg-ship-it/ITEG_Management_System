/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { MdWork, MdDashboard } from "react-icons/md";
import { RiTv2Fill } from "react-icons/ri";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [openMenus, setOpenMenus] = useState(() => {
    const path = location.pathname;
    const openMenus = [];

    // Dashboard menu (index 0)

    // Admissions menu (index 1)
    if (path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") {
      openMenus.push(1);
    }
    // Admitted menu (index 2)
    if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/")) {
      openMenus.push(2);
    }
    // Placements menu (index 3)
    if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
      openMenus.push(3);
    }
    if (path.startsWith("/student-profile/")) {
      const lastSection = localStorage.getItem("lastSection");
      openMenus.push(lastSection === "admission" ? 1 : 2);
    }

    return openMenus.length > 0 ? openMenus : [0, 1, 2, 3];
  });

  useEffect(() => {
    const path = location.pathname;
    const newOpenMenus = [];

    // Dashboard menu (index 0)

    // Admissions menu (index 1)
    if (path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") {
      newOpenMenus.push(1);
      localStorage.setItem("lastSection", "admission");
    }
    // Admitted menu (index 2)
    if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/")) {
      newOpenMenus.push(2);
      localStorage.setItem("lastSection", "admitted");
    }
    // Placements menu (index 3)
    if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
      newOpenMenus.push(3);
    }
    if (path.startsWith("/student-profile/")) {
      const lastSection = localStorage.getItem("lastSection");
      newOpenMenus.push(lastSection === "admission" ? 1 : 2);
    }

    if (newOpenMenus.length > 0) {
      setOpenMenus((prev) => [...new Set([...prev, ...newOpenMenus])]);
    }
  }, [location.pathname]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const isSubMenuActive = (subPath) => {
    const path = location.pathname;

    // if (subPath === "/") {
    //   return path === "/" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record";
    // }
    if (subPath === "/") {
      return path === "/";
    }

    if (subPath === "/attendance-details") {
      return path === "/attendance-details";
    }



    if (subPath === "/admission-process") {
      return path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record";
    }

    if (subPath === "/student-dashboard") {
      return path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student-profile/") || path.includes("/level-interviews");
    }

    if (subPath === "/student-permission") {
      return path === "/student-permission";
    }

    if (subPath === "/readiness-status") {
      return path === "/readiness-status" || path.startsWith("/interview-history/") || path.startsWith("/interview-rounds-history/");
    }

    if (subPath === "/company-details") {
      return path === "/company-details" || path.startsWith("/placement/");
    }

    if (subPath === "/placement-post") {
      return path === "/placement-post";
    }

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
      roles: ["superadmin", "admin"],
      subMenu: [
        { name: "Admission Workflow", path: "/admission-process" },
      ],
    },
    {
      name: "Admitted",
      icon: <FaClipboardList />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Student Progress", path: "/student-dashboard" },
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
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-30 mt-2 transition-all duration-300 bg-[var(--backgroundColor)] border-r shadow-md ${isOpen ? "w-64" : "w-12"
          } h-[calc(100vh-4rem)]`}
      >
        {/* Sidebar toggle */}
        <div className="flex items-center justify-between p-4 pt-6">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-black text-xl"
          >
            <IoMenu />
            {isOpen && <span className="text-sm font-semibold">Hide Menu</span>}
          </button>
        </div>

        {/* Sidebar links */}
        {isOpen && (
          <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto">
            {menuItems
              .filter((item) => item.roles.includes(role))
              .map((item, idx) => {
                const isActive = openMenus.includes(idx);
                return (
                  <div key={idx}>
                    <div
                      onClick={() => toggleMenu(idx)}
                      className={`group flex text-[1.1rem] items-center justify-between px-3 py-3 rounded cursor-pointer font-semibold ${isActive ? "text-gray-700" : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="relative flex items-center">
                        <span className="hidden group-hover:block">
                          {isActive ? <HiChevronUp /> : <HiChevronDown />}
                        </span>
                      </div>
                    </div>

                    {/* Submenus */}
                    {isActive && (
                      <div className="ml-1">
                        {item.subMenu.map((sub, i) => {
                          const active = isSubMenuActive(sub.path);
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={`block rounded px-3 py-2 text-md transition-colors duration-200 border-l-4 ${active
                                ? "bg-brandYellowOpacity text-brandYellow font-semibold border-brandYellow"
                                : "text-gray-700 border-transparent hover:text-brandYellow"
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
      </aside>

      {/* Main content */}
      <main
        className={`flex-1 bg-white pt-20 px-4 transition-all duration-300 ${isOpen ? "ml-64" : "ml-16"
          } overflow-x-hidden`}
      >
        {children}
      </main>
    </div>
  );
};

export default Sidebar;