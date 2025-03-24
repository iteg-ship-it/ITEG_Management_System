import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "../../../assets/images/logo.png";
import admissionIcon from "../../../assets/icons/fluent_desktop-cursor-20-filled.png";
import studentRecordIcon from "../../../assets/icons/fa6-solid_clipboard-list.png";
import placementIcon from "../../../assets/icons/vaadin_academy-cap.png";
import up from "../../../assets/icons/weui_arrow-filled.png";
import down from "../../../assets/icons/up_weui_arrow-filled.png";

const menuItems = [
  {
    name: "Add Process",
    icon: admissionIcon,
    roles: ["admin"],
    subMenu: [
      { name: "Dashboard", path: "/" },
      { name: "Admission Process", path: "/admission" },
    ],
  },
  {
    name: "Student Record",
    icon: studentRecordIcon,
    roles: ["admin", "teacher"],
    subMenu: [
      { name: "Student Profiles", path: "/student-record" },
      { name: "Permission Students", path: "/permission-students" },
      { name: "Attendance Info", path: "/attendance-info" },
      { name: "Level Info", path: "/level-info" },
      { name: "Interview Record", path: "/interview-record" },
    ],
  },
  {
    name: "Placement Info",
    icon: placementIcon,
    roles: ["admin", "teacher", "student"],
    subMenu: [
      { name: "Readiness Status", path: "/readiness-status" },
      { name: "Interview Record", path: "/placement-interview-record" },
      { name: "Company Data", path: "/company-data" },
      { name: "Placement Post", path: "/placement-post" },
    ],
  },
];

const Sidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(["Add Process"]);

  const toggleMenu = (name) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="flex">
      <div className="relative">
        <div
          className={`bg-white w-64 h-screen fixed top-0 left-0 p-4 shadow-lg transition-transform transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 z-50 flex flex-col`}
        >
          <div className="flex items-center mb-4">
            <img src={logo} alt="Logo" />
          </div>
          <ul className="flex-1">
            {menuItems
              .filter((item) => item.roles.includes(role))
              .map((item, index) => (
                <li
                  key={index}
                  className={`mb-2 rounded-md border-l-4 p-2 ${
                    openMenus.includes(item.name)
                      ? "bg-gray-100 border-orange-500 "
                      : item.name === "Add Process"
                      ? "bg-gray-100 border-orange-500"
                      : "border-transparent"
                  }`}
                >
                  <div
                    className={`    ${
                      openMenus.includes(item.name)
                        ? "bg-gray-300 border-orange-500"
                        : "border-transparent"
                    }`}
                  >
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="flex items-center justify-between w-full text-gray-700 font-bold"
                    >
                      <div className={`flex items-center `}>
                        <img
                          src={item.icon}
                          alt="icon"
                          className="w-5 h-5 mr-3"
                        />
                        {item.name}
                      </div>
                      <img
                        src={openMenus.includes(item.name) ? up : down}
                        alt="toggle icon"
                      />
                    </button>
                  </div>
                  {openMenus.includes(item.name) && (
                    <ul className="ml-4 mt-2">
                      {item.subMenu.map((subItem, subIndex) => (
                        <li key={subIndex} className="p-2">
                          <Link
                            to={subItem.path}
                            className="text-gray-700 hover:text-orange-400"
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        </div>
        <button
          className={`md:hidden fixed top-4 left-4 p-2 bg-gray-200 rounded z-50 transition-transform transform ${
            isOpen ? "translate-x-64" : "translate-x-0"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu />
        </button>
      </div>
      <div className="flex-1 md:ml-64  overflow-y-auto h-screen">
        {/* Main Content */}
      </div>
    </div>
  );
};

export default Sidebar;

// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { Menu } from "lucide-react";
// import logo from "../../../assets/images/logo.png";
// import admissionIcon from "../../../assets/icons/fluent_desktop-cursor-20-filled.png";
// import studentRecordIcon from "../../../assets/icons/fa6-solid_clipboard-list.png";
// import placementIcon from "../../../assets/icons/vaadin_academy-cap.png";
// import up from "../../../assets/icons/weui_arrow-filled.png";
// import down from "../../../assets/icons/weui_arrow-filled.png";

// const menuItems = [
//   {
//     name: "Add Process",
//     icon: admissionIcon,
//     roles: ["admin"],
//     subMenu: [
//       { name: "Dashboard", path: "/dashboard" },
//       { name: "Admission Process", path: "/admission" },
//     ],
//   },
//   {
//     name: "Student Record",
//     icon: studentRecordIcon,
//     roles: ["admin", "teacher"],
//     subMenu: [
//       { name: "Student Profiles", path: "/student-profiles" },
//       { name: "Permission Students", path: "/permission-students" },
//       { name: "Attendance info", path: "/attendance-info" },
//       { name: "Level Info", path: "/level-info" },
//       { name: "Interview Record", path: "/interview-record" },
//     ],
//   },
//   {
//     name: "Placement Info",
//     icon: placementIcon,
//     roles: ["admin", "teacher", "student"],
//     subMenu: [
//       { name: "Readiness Status", path: "/readiness-status" },
//       { name: "Interview Record", path: "/placement-interview-record" },
//       { name: "Company Data", path: "/company-data" },
//       { name: "Placement Post", path: "/placement-post" },
//     ],
//   },
// ];

// const Sidebar = ({ role }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [openMenu, setOpenMenu] = useState(null);

//   const toggleMenu = (index) => {
//     setOpenMenu(openMenu === index ? null : index);
//   };

//   return (
//     <div className="flex">
//       <div className="relative">
//         <div
//           className={`bg-white w-64 h-screen fixed top-0 left-0 p-4 shadow-lg transition-transform transform ${
//             isOpen ? "translate-x-0" : "-translate-x-full"
//           } md:translate-x-0 z-50 flex flex-col`}
//         >
//           <div className="flex items-center mb-4">
//             <img src={logo} alt="Logo" />
//           </div>
//           <ul className="flex-1 ">
//             {menuItems
//               .filter((item) => item.roles.includes(role))
//               .map((item, index) => (
//                 <li key={index} className="mb-2 hover:bg-gray-200 rounded-md ">
//                   <button
//                     onClick={() => toggleMenu(index)}
//                     className="flex items-center justify-between p-2 w-full text-gray-700 hover:bg-gray-300 rounded-md"
//                   >
//                     <div className="flex items-center font-bold ">
//                       <img
//                         src={item.icon}
//                         alt="icon"
//                         className="w-5 h-5 mr-3"
//                       />
//                       {item.name}
//                     </div>
//                     <img
//                       src={openMenu === index ? up : down}
//                       alt="toggle icon"
//                     />
//                   </button>
//                   {openMenu === index && (
//                     <ul className="ml-4 mt-2 ">
//                       {item.subMenu.map((subItem, subIndex) => (
//                         <li key={subIndex} className="p-2">
//                           <Link
//                             to={subItem.path}
//                             className="text-gray-700  hover:text-orange-400 "
//                           >
//                             {subItem.name}
//                           </Link>
//                         </li>
//                       ))}
//                     </ul>
//                   )}
//                 </li>
//               ))}
//           </ul>
//         </div>
//         <button
//           className={`md:hidden fixed top-4 left-4 p-2 bg-gray-200 rounded z-50 transition-transform transform ${
//             isOpen ? "translate-x-64" : "translate-x-0"
//           }`}
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <Menu />
//         </button>
//       </div>
//       <div className="flex-1 md:ml-64 p-4 overflow-y-auto h-screen">
//         {/* Main Content */}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

// ---------------------------------------------------------

// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { Menu } from "lucide-react";
// import logo from "../../../assets/images/logowithname.png";

// const roles = {
//   admin: [
//     { name: "Admission Process", path: "/admission" },
//     { name: "Student Record", path: "/student-record" },
//     { name: "Placement Information", path: "/placement" },
//   ],
//   teacher: [
//     { name: "Student Record", path: "/student-record" },
//     { name: "Placement Information", path: "/placement" },
//   ],
//   student: [{ name: "Placement Information", path: "/placement" }],
// };

// const Sidebar = ({ role }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   if (!roles[role]) {
//     return <p className="text-red-600">Invalid Role</p>;
//   }

//   return (
//     <div className="flex">
//       {/* Sidebar with floating button */}
//       <div className="relative">
//         <div
//           className={`bg-white w-64 h-screen fixed top-0 left-0 p-4 shadow-lg transition-transform transform ${
//             isOpen ? "translate-x-0" : "-translate-x-full"
//           } md:translate-x-0 z-50 flex flex-col`}
//         >
//           <div className="flex items-center mb-4">
//             <img src={logo} alt="Logo" />
//           </div>
//           <ul className="flex-1">
//             {roles[role].map((item, index) => (
//               <li key={index} className="p-2 hover:bg-gray-200 rounded-md">
//                 <Link to={item.path} className="text-gray-700">
//                   {item.name}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Mobile Menu Button (Floats with Sidebar) */}
//         <button
//           className={`md:hidden fixed top-4 left-4 p-2 bg-gray-200 rounded z-50 transition-transform transform ${
//             isOpen ? "translate-x-64" : "translate-x-0"
//           }`}
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <Menu />
//         </button>
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 md:ml-64 p-4 overflow-y-auto h-screen">
//         {/* Content goes here */}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;
