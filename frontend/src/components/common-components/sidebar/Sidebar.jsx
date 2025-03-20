import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import logo from "../../../assets/images/SSISM LOGO updated.png";
import admissionIcon from "../../../assets/icons/vac1.png";
import studentRecordIcon from "../../../assets/icons/vac2.png";
import placementIcon from "../../../assets/icons/vac3.png";

const menuItems = [
  {
    name: "Add Process",
    icon: admissionIcon,
    subMenu: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Admission Process", path: "/admission" },
    ],
  },
  {
    name: "Student Record",
    icon: studentRecordIcon,
    subMenu: [
      { name: "Student Profiles", path: "/student-profiles" },
      { name: "Permission Students", path: "/permission-students" },
      { name: "Attendance Info", path: "/attendance-info" },
      { name: "Level Info", path: "/level-info" },
      { name: "Interview Record", path: "/interview-record" },
    ],
  },
  {
    name: "Placement Info",
    icon: placementIcon,
    subMenu: [
      { name: "Readiness Status", path: "/readiness-status" },
      { name: "Interview Record", path: "/placement-interview-record" },
      { name: "Company Data", path: "/company-data" },
      { name: "Placement Post", path: "/placement-post" },
    ],
  },
];

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex">
      {/* Sidebar - Fixed */}
      <div className="h-screen bg-white shadow-lg p-4 w-64 fixed top-0 left-0">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <img src={logo} alt="Logo" className="h-16" />
        </div>

        {/* Sidebar Menu */}
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {/* Main Menu Item with Hover Effect */}
              <button
                className={`w-full flex justify-between items-center px-3 py-2 rounded-md transition-colors duration-200 hover:bg-gray-300`}
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center">
                  <img src={item.icon} alt={item.name} className="h-5 mr-2" />
                  {item.name}
                </div>
                {openSections[index] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {/* Dropdown Submenu */}
              {openSections[index] && (
                <ul className="pl-6 mt-1 space-y-1">
                  {item.subMenu.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <NavLink
                        to={subItem.path}
                        className="block px-3 py-1 rounded-md transition-colors duration-200 hover:text-orange-500"
                      >
                        {subItem.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
   
      <div className="ml-64 flex-1 p-6 bg-gray-100 min-h-screen">
      </div>
    </div>
  );
};

export default Sidebar;



