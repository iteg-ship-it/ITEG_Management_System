import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "../../../assets/images/logo.png";

const roles = {
  admin: [
    { name: "Admission Process", path: "/admission" },
    { name: "Student Record", path: "/student-record" },
    { name: "Placement Information", path: "/placement" },
  ],
  teacher: [
    { name: "Student Record", path: "/student-record" },
    { name: "Placement Information", path: "/placement" },
  ],
  student: [{ name: "Placement Information", path: "/placement" }],
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
          <div className="flex items-center mb-4">
            <img src={logo} alt="Logo" className="h-16 w-16 p-2 rounded-full" />
            <div className="flex justify-end px-5">
              <h2 className="text-lg font-bold uppercase">
                Sant Singaji Educational Society
              </h2>
            </div>
          </div>
          <ul className="flex-1">
            {roles[role].map((item, index) => (
              <li key={index} className="p-2 hover:bg-gray-200 rounded-md">
                <Link to={item.path} className="text-gray-700">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Menu Button (Floats with Sidebar) */}
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
      <div className="flex-1 md:ml-64 p-4 overflow-y-auto h-screen">
        {/* Content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;
