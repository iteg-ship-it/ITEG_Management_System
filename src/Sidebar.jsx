import React, { useState } from "react";
import {
  FaUserGraduate,
  FaClipboardList,
  FaBriefcase,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import RegistrationForm from "./RegistrationForm ";
import ProfilePage from "./StudentProfile";
import StudentRecord from "./studentRecord";

// Example components for each sidebar option
// const StudentRecord = () => <div>Student Record Component</div>;
const PlacementInformation = () => <div>Placement Information Component</div>;

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("AdmissionProcess"); // Default component

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClick = (component) => {
    setActiveComponent(component); // Update the active component
    setIsSidebarOpen(false); // Close sidebar on mobile after clicking
  };
  //aapko yaha sabse pahle jo component banaya he usko import karna he
  //  fir niche list item me ek or new fild add krna he
  // fir yaha ek or new switch case add krna he
  //  or usme jo component apne import kara tha usko return karva dena he
  // or jo demo ke lie function banaya he usko remove krna he
  //All set '

  // Render the active component
  const renderComponent = () => {
    switch (activeComponent) {
      case "AdmissionProcess":
        return <ProfilePage />;
      case "StudentRecord":
        return <StudentRecord />;
      case "PlacementInformation":
        return <RegistrationForm />;
      default:
        return <RegistrationForm />; // Fallback
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar Toggle Button for Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 bg-orange-500 text-white p-2 rounded-lg z-50"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative w-full md:w-68 bg-white p-4 shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex md:flex-col lg:flex-row md:items-start mt-10 items-center">
          <img
            className="h-20 object-cover mb-4"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBjw8YBC_nn5QPHaP3T1IfWTQTQ6dASsbwpA&s"
            alt="College Logo"
          />
          <h1 className="text-xl font-bold mb-6 w-52  mx-2">
            SANT SINGAJI EDUCATIONAL SOCIETY
          </h1>
        </div>

        {/* yaha par new feild  add kar sakte he */}
        <ul className="mt-6 space-y-4 ">
          <li
            className="flex items-center text-gray-600 font-medium space-x-2 cursor-pointer"
            onClick={() => handleSidebarClick("AdmissionProcess")}
          >
            <FaUserGraduate />
            <span>Admission Process</span>
          </li>
          <li
            className="flex items-center text-gray-600 font-medium space-x-2 cursor-pointer"
            onClick={() => handleSidebarClick("StudentRecord")}
          >
            <FaClipboardList />
            <span>Student Record</span>
          </li>
          <li
            className="flex items-center text-gray-600 font-medium space-x-2 cursor-pointer"
            onClick={() => handleSidebarClick("PlacementInformation")}
          >
            <FaBriefcase />
            <span>Placement Information</span>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="w-full  p-6 md:p-5 overflow-y-scroll">
        <div className="bg-white p-6 md:p-8 shadow-md rounded-lg relative ">
          {/* Render the active component */}
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
