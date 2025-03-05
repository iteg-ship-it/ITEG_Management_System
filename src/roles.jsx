import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "../../assets/images/logo.png";

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
    <div>
      {/* Toggle Button for Mobile View */}
      <button
        className="md:hidden p-2 m-2 bg-gray-200 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu />
      </button>
      {/* Sidebar */}
      <div
        className={`bg-white w-64 min-h-screen p-4 shadow-lg fixed md:relative transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center mb-4">
          <img src={logo} alt="Logo" className="h-16 w-16 p-2 rounded-full" />
          <h2 className="mx-2 text-lg font-bold">
            Sant Singaji Education Society
          </h2>
        </div>
        <ul>
          {roles[role].map((item, index) => (
            <li key={index} className="p-2 hover:bg-gray-200 rounded-md">
              <Link to={item.path} className="text-gray-700">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
