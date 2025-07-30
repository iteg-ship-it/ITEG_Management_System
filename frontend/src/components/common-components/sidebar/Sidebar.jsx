/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { GiGraduateCap } from "react-icons/gi";
import { RiTv2Fill } from "react-icons/ri";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [openMenus, setOpenMenus] = useState(() => {
    const path = location.pathname;
    const openMenus = [];

    // if (path === "/" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record")
    if (path === "/" || path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") 
      {
      openMenus.push(0);
    }
    if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission") {
      openMenus.push(1);
    }
    if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/")) {
      openMenus.push(2);
    }
    if (path.startsWith("/student-profile/")) {
      const lastSection = localStorage.getItem("lastSection");
      openMenus.push(lastSection === "admission" ? 0 : 1);
    }

    return openMenus.length > 0 ? openMenus : [0, 1, 2];
  });

  useEffect(() => {
    const path = location.pathname;
    const newOpenMenus = [];

    // if (path === "/" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record") 
    if (path === "/" || path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record")
      {
      newOpenMenus.push(0);
      localStorage.setItem("lastSection", "admission");
    }
    if (path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student/") || path === "/student-permission" || path.startsWith("/student-profile/")) {
      newOpenMenus.push(1);
      localStorage.setItem("lastSection", "admitted");
    }
    if (path === "/readiness-status" || path === "/placement-interview-record" || path === "/placement-post" || path.startsWith("/interview-history/")) {
      newOpenMenus.push(2);
    }
    if (path.startsWith("/student-profile/")) {
      const lastSection = localStorage.getItem("lastSection");
      newOpenMenus.push(lastSection === "admission" ? 0 : 1);
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

    if (subPath === "/admission-process") {
      return path === "/admission-process" || path.startsWith("/admission/") || path.startsWith("/interview-detail/") || path === "/admission-record";
    }

    if (subPath === "/student-dashboard") {
      return path === "/student-dashboard" || path === "/student-detail-table" || path.startsWith("/student-profile/");
    }

    if (subPath === "/student-permission") {
      return path === "/student-permission";
    }

    if (subPath === "/readiness-status") {
      return path === "/readiness-status" || path.startsWith("/interview-history/");
    }

    if (subPath === "/placement-interview-record") {
      return path === "/placement-interview-record";
    }

    if (subPath === "/placement-post") {
      return path === "/placement-post";
    }

    return path === subPath || path.startsWith(subPath + "/");
  };

  const menuItems = [
    {
      name: "Admissions",
      icon: <RiTv2Fill />,
      roles: ["superadmin", "admin"],
      subMenu: [
        // { name: "Admission WorkFlow", path: "/" }
        { name: "Dashboard", path: "/" },
        { name: "Admission WorkFlow", path: "/admission-process" },
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
      icon: <GiGraduateCap />,
      roles: ["superadmin", "admin", "faculty"],
      subMenu: [
        { name: "Placement Candidates", path: "/readiness-status" },
        { name: "Interview Record", path: "/placement-interview-record" },
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



// /* eslint-disable react/prop-types */
// import { useState, useEffect } from "react";
// import { Link, useLocation } from "react-router-dom";
// import { IoMenu } from "react-icons/io5";
// import { FaClipboardList } from "react-icons/fa6";
// import { GiGraduateCap } from "react-icons/gi";
// import { RiTv2Fill } from "react-icons/ri";
// import { HiChevronUp, HiChevronDown } from "react-icons/hi";

// const Sidebar = ({ children }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const location = useLocation();
//   const role = (localStorage.getItem("role") || "").toLowerCase();
  
//   // Update open menus when location changes
//   useEffect(() => {
//     const path = location.pathname;
//     const newOpenMenus = [];
    
//     // Admissions menu (index 0)
//     if (path === "/" || path.startsWith("/admission/") || 
//         path.startsWith("/interview-detail/") || path === "/admission-record") {
//       newOpenMenus.push(0);
      
//       // Store the source section in localStorage to remember where we came from
//       localStorage.setItem("lastSection", "admission");
//     }
    
//     // Admitted menu (index 1)
//     if (path === "/student-dashboard" || path === "/student-detail-table" || 
//         path.startsWith("/student/") || path === "/student-permission" ||
//         path.startsWith("/student-profile/")) {
//       newOpenMenus.push(1);
      
//       // Store the source section in localStorage to remember where we came from
//       localStorage.setItem("lastSection", "admitted");
//     }
    
//     // Placements menu (index 2)
//     if (path === "/readiness-status" || path === "/placement-interview-record" || 
//         path === "/placement-post") {
//       newOpenMenus.push(2);
//     }
    
//     // Special handling for student profile pages to maintain the correct active section
//     if (path.startsWith("/student-profile/")) {
//       const lastSection = localStorage.getItem("lastSection");
//       if (lastSection === "admission") {
//         newOpenMenus.push(0); // Keep Admission menu open
//       } else {
//         newOpenMenus.push(1); // Default to Admitted menu
//       }
//     }
    
//     // Only update if we have matches and the current openMenus doesn't include all of them
//     if (newOpenMenus.length > 0) {
//       setOpenMenus(prev => {
//         // Keep existing open menus and add new ones
//         const combined = [...new Set([...prev, ...newOpenMenus])];
//         return combined;
//       });
//     }
//   }, [location.pathname]);

//   // Initialize open menus based on current path
//   const getInitialOpenMenus = () => {
//     const path = location.pathname;
//     const openMenus = [];
    
//     // Admissions menu (index 0)
//     if (path === "/" || path.startsWith("/admission/") || 
//         path.startsWith("/interview-detail/") || path === "/admission-record") {
//       openMenus.push(0);
//     }
    
//     // Admitted menu (index 1)
//     if (path === "/student-dashboard" || path === "/student-detail-table" || 
//         path.startsWith("/student/") || path === "/student-permission") {
//       openMenus.push(1);
//     }
    
//     // Placements menu (index 2)
//     if (path === "/readiness-status" || path === "/placement-interview-record" || 
//         path === "/placement-post") {
//       openMenus.push(2);
//     }
    
//     // Special handling for student profile pages
//     if (path.startsWith("/student-profile/")) {
//       const lastSection = localStorage.getItem("lastSection");
//       if (lastSection === "admission") {
//         openMenus.push(0); // Keep Admission menu open
//       } else {
//         openMenus.push(1); // Default to Admitted menu
//       }
//     }
    
//     // Default to all open if no match
//     return openMenus.length > 0 ? openMenus : [0, 1, 2];
//   };
  
//   const [openMenus, setOpenMenus] = useState(getInitialOpenMenus());

//   const menuItems = [
//     {
//       name: "Admissions",
//       icon: <RiTv2Fill />,
//       roles: ["superadmin", "admin"],
//       subMenu: [
//         // { name: "Dashboard", path: "/" },
//         { name: "Admission WorkFlow", path: "/" },
//       ],
//     },
//     {
//       name: "Admitted",
//       icon: <FaClipboardList />,
//       roles: ["superadmin", "admin", "faculty"],
//       subMenu: [
//         { name: "Student Progress", path: "/student-dashboard" },
//         { name: "Dummy Students", path: "/student-permission" },
//       ],
//     },
//     {
//       name: "Placements",
//       icon: <GiGraduateCap />,
//       roles: ["superadmin", "admin", "faculty"],
//       subMenu: [
//         { name: "Placement Candidates", path: "/readiness-status" },
//         { name: "Interview Record", path: "/placement-interview-record" },
//         { name: "Placed Students", path: "/placement-post" },
//       ],
//     },
//   ];

//   const toggleMenu = (index) => {
//     setOpenMenus((prev) =>
//       prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
//     );
//   };

//   return (
//     <div className="flex">
//       {/* Sidebar */}
//       <aside
//         className={`fixed top-16 left-0 z-30 mt-2 transition-all duration-300 bg-[var(--backgroundColor)] border-r shadow-md ${isOpen ? "w-64" : "w-12"
//           } h-[calc(100vh-4rem)]`}
//       >
//         {/* Sidebar toggle */}
//         <div className="flex items-center justify-between p-4 pt-6">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="flex items-center gap-2 text-black text-xl "
//           >
//             <IoMenu />
//             {isOpen && <span className="text-sm font-semibold">Hide Menu</span>}
//           </button>
//         </div>

//         {/* Sidebar links */}
//         {isOpen && (
//           <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto">
//             {menuItems
//               .filter((item) => item.roles.includes(role))
//               .map((item, idx) => {
//                 const hasActiveSubLink = item.subMenu.some(
//                   (s) =>
//                     location.pathname === s.path ||
//                     location.pathname.startsWith(s.path + "/")
//                 );
//                 const isActive = openMenus.includes(idx) || hasActiveSubLink;

//                 return (
//                   <div key={idx}>
//                     <div
//                       onClick={() => toggleMenu(idx)}
//                       className={`group flex text-[1.1rem] items-center justify-between px-3 py-3 rounded cursor-pointer font-semibold ${isActive ? "text-gray-700" : "hover:bg-gray-100 text-gray-700"
//                         }`}
//                     >
//                       <div className="flex items-center gap-3">
//                         <span>{item.icon}</span>
//                         <span>{item.name}</span>
//                       </div>
//                       <div className="relative flex items-center">
//                         <span className="hidden group-hover:block">
//                           {isActive ? <HiChevronUp /> : <HiChevronDown />}
//                         </span>
//                       </div>
//                     </div>

//                     {/* submenus */}
//                     {isActive && (
//                       <div className="ml-1 ">
//                         {item.subMenu.map((sub, i) => {
//                           // Check if this is the active route
//                           let active = location.pathname === sub.path ||
//                             location.pathname.startsWith(sub.path + "/");
                            
//                           // Special cases to keep sidebar items active when navigating between related pages
//                           if ((location.pathname === "/student-detail-table" || 
//                                location.pathname.startsWith("/student-profile/")) && 
//                               sub.path === "/student-dashboard") {
//                             active = true;
//                           }
                          
//                           // Keep Admission WorkFlow active for admission-related pages
//                           if ((location.pathname.startsWith("/admission/") || 
//                                location.pathname.startsWith("/interview-detail/") ||
//                                location.pathname === "/admission-record") && 
//                               sub.path === "/") {
//                             active = true;
//                           }
                          
//                           // Special handling for student profile pages
//                           if (location.pathname.startsWith("/student-profile/")) {
//                             const lastSection = localStorage.getItem("lastSection");
//                             if (lastSection === "admission" && sub.path === "/") {
//                               active = true; // Keep Admission WorkFlow active
//                             } else if ((lastSection === "admitted" || !lastSection) && sub.path === "/student-dashboard") {
//                               active = true; // Keep Student Progress active
//                             }
//                           }
                          
//                           // Keep Placement Candidates active for placement-related pages
//                           if (sub.path === "/readiness-status" && 
//                               (location.pathname.includes("/placement-") || 
//                                location.pathname.includes("/readiness-"))) {
//                             active = true;
//                           }
//                           return (
//                             <Link
//                               key={i}
//                               to={sub.path}
//                               className={`block rounded px-3 py-2 text-md transition-colors duration-200 border-l-4 ${active
//                                 ? "bg-brandYellowOpacity text-brandYellow font-semibold border-brandYellow"
//                                 : "text-gray-700 border-transparent hover:text-brandYellow"
//                                 }`}
//                             >
//                               {sub.name}
//                             </Link>
//                           );
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//           </nav>
//         )}
//       </aside>

//       {/* Main content */}
//       <main
//         className={`flex-1 bg-white pt-20 px-4 transition-all duration-300 ${isOpen ? "ml-64" : "ml-16"
//           } overflow-x-hidden`}
//       >
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Sidebar;

// // /* eslint-disable react/prop-types */
// // import { useState } from "react";
// // import { Link, useLocation } from "react-router-dom";
// // import {
// //   HiMenuAlt1,
// //   HiOutlineAcademicCap,
// //   HiOutlineClipboardList,
// //   HiOutlineBriefcase,
// // } from "react-icons/hi";

// // const Sidebar = ({ children }) => {
// //   const [isOpen, setIsOpen] = useState(true);
// //   const [openMenus, setOpenMenus] = useState([0]);
// //   const location = useLocation();
// //   const role = (localStorage.getItem("role") || "").toLowerCase();

// //   const menuItems = [
// //     {
// //       name: "Admission",
// //       icon: <HiOutlineAcademicCap />,
// //       roles: ["superadmin", "admin"],
// //       subMenu: [
// //         { name: "Dashboard", path: "/" },
// //         { name: "Admission WorkFlow", path: "/admission" },
// //       ],
// //     },
// //     {
// //       name: "Admitted",
// //       icon: <HiOutlineClipboardList />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Student Progress", path: "/student-dashboard" },
// //         { name: "Dummy Students", path: "/student-permission" },
// //       ],
// //     },
// //     {
// //       name: "Placements",
// //       icon: <HiOutlineBriefcase />,
// //       roles: ["superadmin", "admin", "faculty"],
// //       subMenu: [
// //         { name: "Placement Candidates", path: "/readiness-status" },
// //         { name: "Interview Record", path: "/placement-interview-record" },
// //         { name: "Placed Students", path: "/placement-post" },
// //       ],
// //     },
// //   ];

// //   const toggleMenu = (index) => {
// //     setOpenMenus((prev) =>
// //       prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
// //     );
// //   };

// //   return (
// //     <div className="flex ">
// //       {/* Sidebar */}
// //       <aside
// //         className={`fixed top-16 left-0 z-30 mt-2 transition-all duration-300 bg-white border-r shadow-md ${isOpen ? "w-64" : "w-16"
// //           } h-[calc(100vh-4rem)]`} // 4rem = 64px header height
// //       >
// //         {/* Sidebar toggle */}
// //         <div className="flex items-center justify-between p-4 border-b">
// //           <button
// //             onClick={() => setIsOpen(!isOpen)}
// //             className="flex items-center gap-2 text-gray-700 text-xl"
// //           >
// //             <HiMenuAlt1 />
// //             {isOpen && (
// //               <span className="text-xs font-medium">Hide Menu</span>
// //             )}
// //           </button>
// //         </div>

// //         {/* Sidebar links */}
// //         <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto">
// //           {menuItems
// //             .filter((item) => item.roles.includes(role))
// //             .map((item, idx) => {
// //               const hasActiveSubLink = item.subMenu.some(
// //                 (s) =>
// //                   location.pathname === s.path ||
// //                   location.pathname.startsWith(s.path + "/")
// //               );
// //               const isActive = openMenus.includes(idx) || hasActiveSubLink;

// //               return (
// //                 <div key={idx}>
// //                   <div
// //                     onClick={() => toggleMenu(idx)}
// //                     className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer text-sm font-medium ${isActive
// //                       ? "bg-orange-100 text-orange-600"
// //                       : "hover:bg-gray-100 text-gray-700"
// //                       }`}
// //                   >
// //                     <span className="text-lg">{item.icon}</span>
// //                     {isOpen && <span>{item.name}</span>}
// //                   </div>
// //                   {isActive && isOpen && (
// //                     <div className="ml-8 mt-1 space-y-1">
// //                       {item.subMenu.map((sub, i) => {
// //                         const active =
// //                           location.pathname === sub.path ||
// //                           location.pathname.startsWith(sub.path + "/");
// //                         return (
// //                           <Link
// //                             key={i}
// //                             to={sub.path}
// //                             className={`block text-xs rounded px-2 py-1 ${active
// //                               ? "text-orange-500 font-semibold"
// //                               : "text-gray-600 hover:text-orange-500"
// //                               }`}
// //                           >
// //                             {sub.name}
// //                           </Link>
// //                         );
// //                       })}
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //         </nav>
// //       </aside>

// //       {/* Main content */}
// //       <main
// //         className={`flex-1 bg-[#eef3fb] min-h-screen pt-20 px-4 transition-all duration-300 ${isOpen ? "ml-64" : "ml-16"
// //           }`}
// //       >
// //         {children}
// //       </main>
// //     </div>
// //   );
// // };

// // export default Sidebar;
