/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { GiGraduateCap } from "react-icons/gi";
import { RiTv2Fill } from "react-icons/ri";
import {
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi";

const Sidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const role = (localStorage.getItem("role") || "").toLowerCase();

  const [openMenus, setOpenMenus] = useState([0, 1, 2]);

  const menuItems = [
    {
      name: "Admissions",
      icon: <RiTv2Fill />
      ,
      roles: ["superadmin", "admin"],
      subMenu: [
        { name: "Dashboard", path: "/" },
        { name: "Admission WorkFlow", path: "/admission" },
      ],
    },
    {
      name: "Admitted",
      icon: <FaClipboardList />
      ,
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

  const toggleMenu = (index) => {
    setOpenMenus((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-30 mt-2 transition-all duration-300 bg-[var(--backgroundColor)] border-r shadow-md ${isOpen ? "w-64" : "w-12"
          } h-[calc(100vh-4rem)]`}
      >
        {/* Sidebar toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-black text-xl "
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
                const hasActiveSubLink = item.subMenu.some(
                  (s) =>
                    location.pathname === s.path ||
                    location.pathname.startsWith(s.path + "/")
                );
                const isActive = openMenus.includes(idx) || hasActiveSubLink;

                return (
                  <div key={idx}>
                    <div
                      onClick={() => toggleMenu(idx)}
                      className={`flex items-center justify-between px-3 py-3 rounded cursor-pointer text-base font-semibold ${isActive
                        ? "text-gray-700"
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-xl">
                        {isActive ? <HiChevronUp /> : <HiChevronDown />}
                      </span>
                    </div>

                    {/* submenus */}
                    {isActive && (
                      <div className="ml-1">
                        {item.subMenu.map((sub, i) => {
                          const active =
                            location.pathname === sub.path ||
                            location.pathname.startsWith(sub.path + "/");
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={`block rounded px-3 py-2 text-sm ${active
                                ? "bg-orange-50 text-orange-500 font-semibold border-l-4 border-orange-400"
                                : "text-gray-600 hover:text-orange-500"
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
// import { useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import {
//   HiMenuAlt1,
//   HiOutlineAcademicCap,
//   HiOutlineClipboardList,
//   HiOutlineBriefcase,
// } from "react-icons/hi";

// const Sidebar = ({ children }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [openMenus, setOpenMenus] = useState([0]);
//   const location = useLocation();
//   const role = (localStorage.getItem("role") || "").toLowerCase();

//   const menuItems = [
//     {
//       name: "Admission",
//       icon: <HiOutlineAcademicCap />,
//       roles: ["superadmin", "admin"],
//       subMenu: [
//         { name: "Dashboard", path: "/" },
//         { name: "Admission WorkFlow", path: "/admission" },
//       ],
//     },
//     {
//       name: "Admitted",
//       icon: <HiOutlineClipboardList />,
//       roles: ["superadmin", "admin", "faculty"],
//       subMenu: [
//         { name: "Student Progress", path: "/student-dashboard" },
//         { name: "Dummy Students", path: "/student-permission" },
//       ],
//     },
//     {
//       name: "Placements",
//       icon: <HiOutlineBriefcase />,
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
//     <div className="flex ">
//       {/* Sidebar */}
//       <aside
//         className={`fixed top-16 left-0 z-30 mt-2 transition-all duration-300 bg-white border-r shadow-md ${isOpen ? "w-64" : "w-16"
//           } h-[calc(100vh-4rem)]`} // 4rem = 64px header height
//       >
//         {/* Sidebar toggle */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="flex items-center gap-2 text-gray-700 text-xl"
//           >
//             <HiMenuAlt1 />
//             {isOpen && (
//               <span className="text-xs font-medium">Hide Menu</span>
//             )}
//           </button>
//         </div>


//         {/* Sidebar links */}
//         <nav className="flex flex-col gap-1 px-2 py-2 overflow-y-auto">
//           {menuItems
//             .filter((item) => item.roles.includes(role))
//             .map((item, idx) => {
//               const hasActiveSubLink = item.subMenu.some(
//                 (s) =>
//                   location.pathname === s.path ||
//                   location.pathname.startsWith(s.path + "/")
//               );
//               const isActive = openMenus.includes(idx) || hasActiveSubLink;

//               return (
//                 <div key={idx}>
//                   <div
//                     onClick={() => toggleMenu(idx)}
//                     className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer text-sm font-medium ${isActive
//                       ? "bg-orange-100 text-orange-600"
//                       : "hover:bg-gray-100 text-gray-700"
//                       }`}
//                   >
//                     <span className="text-lg">{item.icon}</span>
//                     {isOpen && <span>{item.name}</span>}
//                   </div>
//                   {isActive && isOpen && (
//                     <div className="ml-8 mt-1 space-y-1">
//                       {item.subMenu.map((sub, i) => {
//                         const active =
//                           location.pathname === sub.path ||
//                           location.pathname.startsWith(sub.path + "/");
//                         return (
//                           <Link
//                             key={i}
//                             to={sub.path}
//                             className={`block text-xs rounded px-2 py-1 ${active
//                               ? "text-orange-500 font-semibold"
//                               : "text-gray-600 hover:text-orange-500"
//                               }`}
//                           >
//                             {sub.name}
//                           </Link>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//         </nav>
//       </aside>

//       {/* Main content */}
//       <main
//         className={`flex-1 bg-[#eef3fb] min-h-screen pt-20 px-4 transition-all duration-300 ${isOpen ? "ml-64" : "ml-16"
//           }`}
//       >
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Sidebar;

