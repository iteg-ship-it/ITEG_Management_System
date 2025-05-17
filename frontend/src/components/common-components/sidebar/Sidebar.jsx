/* eslint-disable react/prop-types */
// /* eslint-disable react/jsx-no-undef */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "../../../assets/images/logo.png";
import admissionIcon from "../../../assets/icons/fluent_desktop-cursor-20-filled.png";
import studentRecordIcon from "../../../assets/icons/fa6-solid_clipboard-list.png";
import placementIcon from "../../../assets/icons/vaadin_academy-cap.png";
import up from "../../../assets/icons/up_weui_arrow-filled.png";
import down from "../../../assets/icons/weui_arrow-filled.png";


const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState([0]);
  const location = useLocation();
  const menuItems = [
    {
      name: "Add Process",
      icon: admissionIcon,
      roles: ["superadmin", "admin"],
      subMenu: [
        { name: "Dashboard", path: "/" },
        { name: "Admission Process", path: "/admission" },
      ],
    },
    {
      name: "Student Record",
      icon: studentRecordIcon,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Student Profiles", path: "/student-dashboard" },
        { name: "Permission Students", path: "/student-permission" },
        { name: "Attendance Info", path: "/attendance-info" },
        { name: "Level Info", path: "/level-info" },
        { name: "Interview Record", path: "/interview-record" },
      ],
    },
    {
      name: "Placement Info",
      icon: placementIcon,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Readiness Status", path: "/readiness-status" },
        { name: "Interview Record", path: "/placement-interview-record" },
        { name: "Company Data", path: "/company-data" },
        { name: "Placement Post", path: "/placement-post" },
      ],
    },
  ];
  const role = localStorage.getItem("role");
  const normalizedRole = role?.toLowerCase() || "";

  const toggleMenu = (index) => {
    setOpenMenus(
      openMenus.includes(index)
        ? openMenus.filter((item) => item !== index)
        : [...openMenus, index]
    );
  };

  return (
    <div className="flex">
      <div className="relative">
        {/* Sidebar Menu */}
        <div
          className={`bg-white w-64 h-screen fixed top-0 left-0 p-4 shadow-lg transition-transform transform ${isOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 z-50 flex flex-col`}
        >
          {/* Logo */}
          <div className="flex items-center mb-4">
            <img className="h-[11vh]" src={logo} alt="Logo" />
          </div>

          {/* Menu Items */}
          <ul className="flex-1 overflow-y-auto">
            {menuItems
              .filter((item) => item.roles.includes(normalizedRole))
              .map((item, index) => {
                const hasActiveSubLink = item.subMenu.some((subItem) =>
                  location.pathname === subItem.path || location.pathname.startsWith(subItem.path + "/")
                );
                const isActive = openMenus.includes(index) || hasActiveSubLink;

                return (
                  <li key={index} className="mb-2 bg-gray-100">
                    <button
                      onClick={() => toggleMenu(index)}
                      className={`flex items-center justify-between p-2 w-full font-bold text-gray-700 bg-gray-100 rounded-md border-l-4 ${isActive
                        ? "bg-gray-300 border-orange-500"
                        : "bg-white border-white"
                        }`}
                    >
                      <div className="flex items-center">
                        <img src={item.icon} alt="icon" className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                      <img src={isActive ? up : down} alt="toggle icon" />
                    </button>
                    {isActive && (
                      <ul className="ml-4 mt-2">
                        {item.subMenu.map((subItem, subIndex) => {
                          const isActiveLink = location.pathname === subItem.path || location.pathname.startsWith(subItem.path + "/");

                          return (
                            <li key={subIndex} className="p-2">
                              <Link
                                to={subItem.path}
                                className={`text-gray-700 hover:text-orange-400 ${isActiveLink ? "font-bold text-orange-500" : ""
                                  }`}
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden fixed top-4 left-4 p-2 bg-gray-200 rounded z-50 transition-transform transform ${isOpen ? "translate-x-64" : "translate-x-0"
            }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu />
        </button>
      </div>

      {/* ✅ Children will be rendered in the main content area */}
      <div className="flex-1 md:ml-64 overflow-y-auto h-screen p-4">
        {children}</div>
    </div>
  );
};

export default Sidebar;

