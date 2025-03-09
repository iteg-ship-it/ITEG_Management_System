import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "../../../assets/images/SSISM LOGO updated.png";
import admissionIcon from "../../../assets/icons/vac1.png";
import studentRecordIcon from "../../../assets/icons/vac2.png";
import placementIcon from "../../../assets/icons/vac3.png";

const roles = {
  admin: [
    { name: "Admission Process", path: "/admission", icon: admissionIcon },
    {
      name: "Student Record",
      path: "/student-record",
      icon: studentRecordIcon,
    },
    { name: "Placement Information", path: "/placement", icon: placementIcon },
  ],
  teacher: [
    {
      name: "Student Record",
      path: "/student-record",
      icon: studentRecordIcon,
    },
    { name: "Placement Information", path: "/placement", icon: placementIcon },
  ],
  student: [
    { name: "Placement Information", path: "/placement", icon: placementIcon },
  ],
};

const Sidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!roles[role]) {
    return <p className="text-red-600">Invalid Role</p>;
  }

  return (
    <div className="flex">
      {/* Sidebar with floating button */}
      <div className="relative">
        <div
          className={`bg-white w-64 h-screen fixed top-0 left-0 p-4 shadow-lg transition-transform transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-50 flex flex-col`}
        >
          {/* Logo */}
          <div className="flex items-center mb-6">
            <img src={logo} alt="Logo" className="" />
          </div>

          {/* Sidebar Menu */}
          <ul className="flex-1 space-y-4">
            {roles[role].map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 text-gray-700 hover:bg-gray-200 rounded-md ${
                      isActive ? "font-bold " : ""
                    }`
                  }
                >
                  <img src={item.icon} alt={item.name} className="h-4 mr-2" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden fixed top-4 left-4 p-2 bg-gray-200 rounded z-50 transition-transform transform ${
            isOpen ? "translate-x-64" : "translate-x-0"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-56 p-4 overflow-y-auto h-screen">
        {/* Content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;
