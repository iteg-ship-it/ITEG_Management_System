
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu, IoSettingsSharp } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { MdWork, MdDashboard } from "react-icons/md";
import { RiTv2Fill } from "react-icons/ri";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import UserProfile from "../user-profile/UserProfile";

const Sidebar = ({ children }) => {
  const location = useLocation();

  const hasPermission = () => true;

  const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);
  const [openMenus, setOpenMenus] = useState([0]);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const activeIndexes = [];

    if (path === "/" || path === "/attendance-details") activeIndexes.push(0);
    if (path.startsWith("/admission")) activeIndexes.push(1);
    if (path.startsWith("/student")) activeIndexes.push(2);
    if (path.startsWith("/readiness") || path.startsWith("/placement"))
      activeIndexes.push(3);
    if (
      path.startsWith("/department") ||
      path.startsWith("/subdepartment") ||
      path.startsWith("/level") ||
      path.startsWith("/user")
    )
      activeIndexes.push(4);

    if (activeIndexes.length) setOpenMenus(activeIndexes);
  }, [location.pathname]);

  const toggleMenu = (index) => {
    setOpenMenus((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const isSubMenuActive = (subPath) => {
    const path = location.pathname;
    return path === subPath || path.startsWith(subPath + "/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      permission: "dashboard",
      subMenu: [
        { name: "Dashboard", path: "/" },
        { name: "Attendance Details", path: "/attendance-details" },
      ],
    },
    {
      name: "Admissions",
      icon: <RiTv2Fill />,
      permission: "admissionProcess",
      subMenu: [{ name: "Admission Workflow", path: "/admission-process" }],
    },
    {
      name: "Admitted",
      icon: <FaClipboardList />,
      permission: "studentDashboard",
      subMenu: [
        { name: "Student Progress", path: "/student-dashboard" },
        { name: "Level-wise Management", path: "/level-wise-management" },
        { name: "Dummy Students", path: "/student-permission" },
      ],
    },
    {
      name: "Placements",
      icon: <MdWork />,
      permission: "placement",
      subMenu: [
        { name: "Placement Candidates", path: "/readiness-status" },
        { name: "Company Details", path: "/company-details" },
        { name: "Placed Students", path: "/placement-post" },
      ],
    },
    {
      name: "Settings",
      icon: <IoSettingsSharp />,
      permission: "settings",
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

      <div className="flex">
        {/* SIDEBAR */}
        <aside
          className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
            isOpen ? "w-64" : "w-16"
          }`}
        >
          {/* BRAND */}
          <div className="flex items-center gap-3 px-4 py-5">
            <div className="bg-orange-500 text-white p-2 rounded-lg">🎓</div>

            {isOpen && (
              <div>
                <h1 className="font-semibold text-gray-800 leading-none">
                  EduManager
                </h1>
                <p className="text-xs text-gray-500">Admin Console</p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-auto text-xl text-gray-600"
            >
              <IoMenu />
            </button>
          </div>

          {/* MENU */}
          {isOpen && (
            <nav className="flex flex-col gap-2 px-3 py-2 overflow-y-auto h-[calc(100vh-180px)]">
              {menuItems
                .filter((item) => hasPermission(item.permission))
                .map((item, idx) => {
                  const isActive = openMenus.includes(idx);

                  return (
                    <div key={idx}>
                      {/* PARENT */}
                      <div
                        onClick={() => toggleMenu(idx)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition ${
                          isActive
                            ? "bg-orange-50 text-orange-500 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {item.name}
                        </div>

                        {isActive ? <HiChevronUp /> : <HiChevronDown />}
                      </div>

                      {/* SUBMENU */}
                      {isActive && (
                        <div className="mt-1">
                          {item.subMenu.map((sub, i) => {
                            const active = isSubMenuActive(sub.path);

                            return (
                              <Link
                                key={i}
                                to={sub.path}
                                className={`block ml-8 px-4 py-2.5 text-sm transition relative ${
                                  active
                                    ? "bg-orange-50 text-orange-500 font-medium"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {active && (
                                  <span className="absolute left-0 top-0 h-full w-1 bg-orange-500 rounded-r-md" />
                                )}

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

          {/* USER PROFILE */}
          {isOpen && (
            <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50">
              <UserProfile />
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main
          className={`flex-1 pt-20 bg-[#F8F7F5] min-h-screen transition-all duration-300 ${
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
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { IoMenu, IoSettingsSharp } from "react-icons/io5";
// import { FaClipboardList } from "react-icons/fa6";
// import { MdWork, MdDashboard } from "react-icons/md";
// import { RiTv2Fill } from "react-icons/ri";
// import { HiChevronUp, HiChevronDown } from "react-icons/hi";

// import Header from "./Header";
// import UserProfile from "../user-profile/UserProfile";

// const Sidebar = ({ children }) => {
//   const location = useLocation();

//   const hasPermission = () => true; // Future permission logic

//   const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024);
//   const [openMenus, setOpenMenus] = useState([0]);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsOpen(window.innerWidth >= 1024);
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const path = location.pathname;
//     const activeIndexes = [];

//     if (path === "/" || path === "/attendance-details") activeIndexes.push(0);
//     if (path.startsWith("/admission")) activeIndexes.push(1);
//     if (path.startsWith("/student")) activeIndexes.push(2);
//     if (path.startsWith("/readiness") || path.startsWith("/placement"))
//       activeIndexes.push(3);
//     if (path.startsWith("/department") || path.startsWith("/subdepartment") || path.startsWith("/level") || path.startsWith("/user"))
//       activeIndexes.push(4);

//     if (activeIndexes.length) setOpenMenus(activeIndexes);
//   }, [location.pathname]);

//   const toggleMenu = (index) => {
//     setOpenMenus((prev) =>
//       prev.includes(index)
//         ? prev.filter((i) => i !== index)
//         : [...prev, index]
//     );
//   };

//   const isSubMenuActive = (subPath) => {
//     const path = location.pathname;
//     return path === subPath || path.startsWith(subPath + "/");
//   };

//   const menuItems = [
//     {
//       name: "Dashboard",
//       icon: <MdDashboard />,
//       permission: "dashboard",
//       subMenu: [
//         { name: "Dashboard", path: "/" },
//         { name: "Attendance Details", path: "/attendance-details" },
//       ],
//     },
//     {
//       name: "Admissions",
//       icon: <RiTv2Fill />,
//       permission: "admissionProcess",
//       subMenu: [
//         { name: "Admission Workflow", path: "/admission-process" },
//       ],
//     },
//     {
//       name: "Admitted",
//       icon: <FaClipboardList />,
//       permission: "studentDashboard",
//       subMenu: [
//         { name: "Student Progress", path: "/student-dashboard" },
//         { name: "Level-wise Management", path: "/level-wise-management" },
//         { name: "Dummy Students", path: "/student-permission" },
//       ],
//     },
//     {
//       name: "Placements",
//       icon: <MdWork />,
//       permission: "placement",
//       subMenu: [
//         { name: "Placement Candidates", path: "/readiness-status" },
//         { name: "Company Details", path: "/company-details" },
//         { name: "Placed Students", path: "/placement-post" },
//       ],
//     },
//     {
//       name: "Settings",
//       icon: <IoSettingsSharp />,
//       permission: "settings",
//       subMenu: [
//         { name: "Department Management", path: "/department-management" },
//         { name: "Subdepartments", path: "/subdepartments" },
//         { name: "Levels", path: "/levels" },
//         { name: "User Management", path: "/user-management" },
//         { name: "User Permission", path: "/user-permission" },
//       ],
//     },
//   ];

//   return (
//     <>
//       <Header sidebarOpen={isOpen} />

//       <div className="flex">
//         {/* SIDEBAR */}
//         <aside
//           className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
//             isOpen ? "w-64" : "w-16"
//           }`}
//         >
//           {/* BRAND */}
//           <div className="flex items-center gap-3 px-4 py-5">
//             <div className="bg-orange-400 text-white p-2 rounded-lg">🎓</div>

//             {isOpen && (
//               <div>
//                 <h1 className="font-semibold text-gray-800 leading-none">
//                   EduManager
//                 </h1>
//                 <p className="text-xs text-gray-500">Admin Console</p>
//               </div>
//             )}

//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="ml-auto text-xl text-gray-600"
//             >
//               <IoMenu />
//             </button>
//           </div>

//           {/* MENU */}
//           {isOpen && (
//             <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto h-[calc(100vh-180px)]">
//               {menuItems
//                 .filter((item) => hasPermission(item.permission))
//                 .map((item, idx) => {
//                   const isActive = openMenus.includes(idx);

//                   return (
//                     <div key={idx}>
//                       <div
//                         onClick={() => toggleMenu(idx)}
//                         className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer border-l-4 transition ${
//                           isActive
//                             ? "bg-orange-100 text-orange-500 border-orange-500 font-semibold"
//                             : "text-gray-700 hover:bg-gray-100 border-transparent"
//                         }`}
//                       >
//                         <div className="flex items-center gap-3">
//                           {item.icon}
//                           {item.name}
//                         </div>

//                         {isActive ? <HiChevronUp /> : <HiChevronDown />}
//                       </div>

//                       {isActive && (
//                         <div className="ml-2 mt-1">
//                           {item.subMenu.map((sub, i) => {
//                             const active = isSubMenuActive(sub.path);
//                             return (
//                               <Link
//                                 key={i}
//                                 to={sub.path}
//                                 className={`block ml-6 px-3 py-2 text-sm rounded-lg border-l-4 transition ${
//                                   active
//                                     ? "bg-orange-50 text-orange-500 border-orange-500 font-medium"
//                                     : "text-gray-600 hover:bg-gray-100 border-transparent"
//                                 }`}
//                               >
//                                 {sub.name}
//                               </Link>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//             </nav>
//           )}

//           {/* USER PROFILE */}
//           {isOpen && (
//             <div className="absolute bottom-0 left-0 right-0 border-t bg-gray-50">
//               <UserProfile />
//             </div>
//           )}
//         </aside>

//         {/* MAIN CONTENT */}
//         <main
//           className={`flex-1 pt-20 bg-[#F8F7F5] min-h-screen transition-all duration-300 ${
//             isOpen ? "ml-64" : "ml-16"
//           }`}
//         >
//           {children}
//         </main>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
// // /* eslint-disable react/prop-types */
// // import { useState, useEffect } from "react";
// // import { Link, useLocation } from "react-router-dom";
// // import { IoMenu } from "react-icons/io5";
// // import { FaClipboardList, FaUserGroup } from "react-icons/fa6";
// // import { MdWork, MdDashboard } from "react-icons/md";
// // import { RiTv2Fill } from "react-icons/ri";
// // import { HiChevronUp, HiChevronDown } from "react-icons/hi";
// // import { IoSettingsSharp } from "react-icons/io5";
// // import Header from './Header';

// // const Sidebar = ({ children }) => {
// //   const [isOpen, setIsOpen] = useState(() => {
// //     // Check if screen is large (lg breakpoint is 1024px)
// //     return window.innerWidth >= 1024;
// //   });

// //   // Handle window resize to auto-close/open sidebar based on screen size
// //   useEffect(() => {
// //     const handleResize = () => {
// //       if (window.innerWidth >= 1024) {
// //         setIsOpen(true); // Auto-open on large screens
// //       } else {
// //         setIsOpen(false); // Auto-close on medium/small screens
// //       }
// //     };

// //     window.addEventListener('resize', handleResize);
// //     return () => window.removeEventListener('resize', handleResize);
// //   }, []);
// //   const location = useLocation();
// //   const role = (localStorage.getItem("role") || "").toLowerCase();

// //   const [openMenus, setOpenMenus] = useState(() => {
// //     const path = location.pathname;
// //     const openMenus = [];

// //     // Dashboard menu (index 0)
// //     if (path === "/") {
// //       openMenus.push(0);
// //     }
// //     // Admissions menu (index 1)
// //     if (path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") {
// //       openMenus.push(1);
// //     }
// //     // Admitted menu (index 2)
// //     if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/")) {
// //       openMenus.push(2);
// //     }
// //     // Placements menu (index 3)
// //     if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
// //       openMenus.push(3);
// //     }
// //     // Settings menu (index 4)
// //     if (path === "/department-management" || path === "/subdepartments" || path === "/levels" || path === "/user-management" || path === "/user-permission") {
// //       openMenus.push(4);
// //     }
// //     if (path.startsWith("/student-profile/")) {
// //       const lastSection = localStorage.getItem("lastSection");
// //       openMenus.push(lastSection === "admission" ? 1 : 2);
// //     }

// //      // Department menu (index 3)
// //     // if (path === "/ITEG" || path === "/MEG" || path === "/BEG" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
// //     //   openMenus.push(3);
// //     // }

// //     return openMenus.length > 0 ? openMenus : [0, 1, 2, 3, 4];
// //   });

// //   useEffect(() => {
// //     const path = location.pathname;
// //     const newOpenMenus = [];

// //     // Dashboard menu (index 0)


// //     // Admissions menu (index 1)
// //     if (path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") {
// //       newOpenMenus.push(1);
// //       localStorage.setItem("lastSection", "admission");
// //     }
// //     // Admitted menu (index 2)
// //     if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/")) {
// //       newOpenMenus.push(2);
// //       localStorage.setItem("lastSection", "admitted");
// //     }
// //     // Placements menu (index 3)
// //     if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/") || path === "/company-details" || path.startsWith("/placement/") || path.startsWith("/interview-rounds-history/")) {
// //       newOpenMenus.push(3);
// //     }
// //     // Settings menu (index 4)
// //     if (path === "/department-management" || path === "/subdepartments" || path === "/levels" || path === "/user-management" || path === "/user-permission") {
// //       newOpenMenus.push(4);
// //     }
// //     if (path.startsWith("/student-profile/")) {
// //       const lastSection = localStorage.getItem("lastSection");
// //       newOpenMenus.push(lastSection === "admission" ? 1 : 2);
// //     }

// //     if (newOpenMenus.length > 0) {
// //       setOpenMenus((prev) => [...new Set([...prev, ...newOpenMenus])]);
// //     }
// //   }, [location.pathname]);

// //   const toggleMenu = (index) => {
// //     setOpenMenus((prev) =>
// //       prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
// //     );
// //   };

// //   useEffect(() => {
// //     const handleClickOutside = (event) => {
// //       if (openMenus.includes(4) && !event.target.closest('.settings-menu')) {
// //         setOpenMenus((prev) => prev.filter((i) => i !== 4));
// //       }
// //     };
// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, [openMenus]);

// //   const isSubMenuActive = (subPath) => {
// //     const path = location.pathname;

// //     // if (subPath === "/") {
// //     //   return path === "/" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record";
// //     // }
// //     if (subPath === "/") {
// //       return path === "/";
// //     }

// //     if (subPath === "/attendance-details") {
// //       return path === "/attendance-details";
// //     }



// //     if (subPath === "/admission-process") {
// //       return path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record";
// //     }

// //     if (subPath === "/student-dashboard") {
// //       return path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student-profile/") || path.includes("/level-interviews");
// //     }

// //     if (subPath === "/student-permission") {
// //       return path === "/student-permission";
// //     }

// //     if (subPath === "/readiness-status") {
// //       return path === "/readiness-status" || path.startsWith("/interview-history/") || path.startsWith("/interview-rounds-history/");
// //     }

// //     if (subPath === "/company-details") {
// //       return path === "/company-details" || path.startsWith("/placement/");
// //     }

// //     if (subPath === "/placement-post") {
// //       return path === "/placement-post";
// //     }

// //     return path === subPath || path.startsWith(subPath + "/");
// //   };

// //   const menuItems = [
// //     {
// //       name: "Dashboard",
// //       icon: <MdDashboard />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Dashboard", path: "/" },
// //         { name: "Attendance Details", path: "/attendance-details" },
// //       ],
// //     },
// //     {
// //       name: "Admissions",
// //       icon: <RiTv2Fill />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Admission Workflow", path: "/admission-process" },
// //       ],
// //     },
// //     {
// //       name: "Admitted",
// //       icon: <FaClipboardList />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Student Progress", path: "/student-dashboard" },
// //         { name: "Dummy Students", path: "/student-permission" },
// //       ],
// //     },
// //     {
// //       name: "Placements",
// //       icon: <MdWork />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Placement Candidates", path: "/readiness-status" },
// //         { name: "Company Details", path: "/company-details" },
// //         { name: "Placed Students", path: "/placement-post" },
// //       ],
// //     },
// //     {
// //       name: "Setting",
// //       icon: <IoSettingsSharp />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Department Management", path: "/department-management" },
// //         { name: "Subdepartments", path: "/subdepartments" },
// //         { name: "Levels", path: "/levels" },
// //         { name: "User Management", path: "/user-management" },
// //         { name: "User Permission", path: "/user-permission" },
// //       ],
// //     },
// //   ];

// //   return (
// //     <>
// //       <Header sidebarOpen={isOpen} />
// //       <div className="flex">
// //         {/* Sidebar */}
// //         <aside
// //           className={`fixed top-0 left-0 z-30 transition-all duration-300 bg-[var(--backgroundColor)] border-r shadow-md ${isOpen ? "w-64" : "w-12"
// //             } h-screen`}
// //           style={{ '--sidebar-width': isOpen ? '256px' : '48px' }}
// //         >
// //         {/* Sidebar toggle */}
// //         <div className="flex items-center justify-between p-4 pt-6">
// //           <button
// //             onClick={() => setIsOpen(!isOpen)}
// //             className="flex items-center gap-2 text-black text-xl"
// //           >
// //             <IoMenu />
// //             {isOpen && <span className="text-sm font-semibold">Hide Menu</span>}
// //           </button>
// //         </div>

// //         {/* Sidebar links */}
// //         {isOpen && (
// //           <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto h-[calc(100vh-10rem)] pb-4">
// //             {menuItems
// //               .filter((item) => item.roles.includes(role) && item.name !== "Setting")
// //               .map((item, idx) => {
// //                 const isActive = openMenus.includes(idx);
// //                 return (
// //                   <div key={idx}>
// //                     <div
// //                       onClick={() => toggleMenu(idx)}
// //                       className={`group flex text-[1.1rem] items-center justify-between px-3 py-3 rounded cursor-pointer font-semibold ${isActive ? "text-gray-700" : "hover:bg-gray-100 text-gray-700"
// //                         }`}
// //                     >
// //                       <div className="flex items-center gap-3">
// //                         <span>{item.icon}</span>
// //                         <span>{item.name}</span>
// //                       </div>
// //                       <div className="relative flex items-center">
// //                         <span className="hidden group-hover:block">
// //                           {isActive ? <HiChevronUp /> : <HiChevronDown />}
// //                         </span>
// //                       </div>
// //                     </div>

// //                     {/* Submenus */}
// //                     {isActive && (
// //                       <div className="ml-1">
// //                         {item.subMenu.map((sub, i) => {
// //                           const active = isSubMenuActive(sub.path);
                          
// //                           return (
// //                             <Link
// //                               key={i}
// //                               to={sub.path}
// //                               className={`block rounded px-3 py-2 text-md transition-colors duration-200 border-l-4 ${
// //                                 active
// //                                   ? "bg-brandYellowOpacity text-brandYellow font-semibold border-brandYellow"
// //                                   : "text-gray-700 border-transparent hover:text-brandYellow"
// //                                 }`}
// //                             >
// //                               {sub.name}
// //                             </Link>
// //                           );
// //                         })}
// //                       </div>
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //           </nav>
// //         )}

// //         {/* Fixed Settings Menu at Bottom */}
// //         {isOpen && (
// //           <div className="absolute bottom-0 left-0 right-0 bg-[var(--backgroundColor)] border-t px-2 py-2">
// //             {menuItems
// //               .filter((item) => item.roles.includes(role) && item.name === "Setting")
// //               .map((item, idx) => {
// //                 const settingsIdx = 4;
// //                 const isActive = openMenus.includes(settingsIdx);
// //                 return (
// //                   <div key={idx} className="relative settings-menu">
// //                     {/* Dropdown - Opens Upward */}
// //                     {isActive && (
// //                       <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded shadow-lg">
// //                         {item.subMenu.map((sub, i) => {
// //                           const active = isSubMenuActive(sub.path);
// //                           return (
// //                             <Link
// //                               key={i}
// //                               to={sub.path}
// //                               className={`block rounded px-3 py-2 text-md transition-colors duration-200 border-l-4 ${
// //                                 active
// //                                   ? "bg-brandYellowOpacity text-brandYellow font-semibold border-brandYellow"
// //                                   : "text-gray-700 border-transparent hover:text-brandYellow"
// //                               }`}
// //                             >
// //                               {sub.name}
// //                             </Link>
// //                           );
// //                         })}
// //                       </div>
// //                     )}
                    
// //                     {/* Settings Button */}
// //                     <div
// //                       onClick={() => toggleMenu(settingsIdx)}
// //                       className={`group flex text-[1.1rem] items-center justify-between px-3 py-3 rounded cursor-pointer font-semibold ${isActive ? "bg-gray-100 text-gray-700" : "hover:bg-gray-100 text-gray-700"
// //                         }`}
// //                     >
// //                       <div className="flex items-center gap-3">
// //                         <span>{item.icon}</span>
// //                         <span>{item.name}</span>
// //                       </div>
// //                       <div className="relative flex items-center">
// //                         <span>
// //                           {isActive ? <HiChevronDown /> : <HiChevronUp />}
// //                         </span>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 );
// //               })}
// //           </div>
// //         )}
// //       </aside>

// //       {/* Main content */}
// //       <main
// //         className={`flex-1 bg-white pt-20 px-4 transition-all duration-300 ${isOpen ? "ml-64" : "ml-12"
// //           } overflow-x-hidden`}
// //       >
// //         {children}
// //       </main>
// //     </div>
// //     </>
// //   );
// // };


// // export default Sidebar;