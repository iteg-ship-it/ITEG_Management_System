/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileImg from "../../../assets/images/profile-img.png";
import backIcon from "../../../assets/icons/back-icon.png";

const UserProfile = ({ heading, showBackButton = false, onBack }) => {
  const [open, setOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full p-2 mb-2">
      {/* Avatar & Dropdown */}
      <div className="absolute right-0 top-0" ref={dropdownRef}>
        <img
          src={
            user?.avatar ||
            profileImg
          }
          alt="User avatar"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
        />
        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-50">
            <div className="p-4 flex flex-col items-center border-b">
              <img
                src={user?.avatar || profileImg}
                alt="User"
                className="w-12 h-12 rounded-full mb-2"
              />
              <p className="text-sm font-semibold">{user?.name || "Loading..."}</p>
              <p className="text-xs text-gray-500">{user?.email || "Loading..."}</p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-100 text-sm"
            >
              <FiSettings className="mr-2" /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-100 text-sm"
            >
              <FiLogOut className="mr-2" /> Log out
            </button>
          </div>
        )}
      </div>

      {/* Heading & Back Button */}
      <div className="pr-16">
        <div className="flex items-start gap-2 flex-wrap">
          {showBackButton && (
            <button onClick={onBack || (() => navigate(-1))}>
              <img className="w-6 pt-1" src={backIcon} alt="Back" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold break-words">{heading}</h1>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal user={user} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default UserProfile;

// ─────────────────────────────────────────────
// SettingsModal component inside same file
// ─────────────────────────────────────────────
const SettingsModal = ({ user, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-11/12 max-w-md">
      <div className="bg-[#FCD2AA] p-6 flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-700 text-xl hover:text-black"
        >
          ✕
        </button>
        <div className="relative">
          <img
            src={user?.avatar || profileImg}
            alt="Profile"
            className="rounded-full w-20 h-20 object-cover border-2 border-white"
          />
          <span className="absolute bottom-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
        </div>
        <p className="text-sm text-gray-600 mt-2">{user?.email || "Loading..."}</p>
        <h2 className="font-bold text-lg mt-1">Edit Profile</h2>
      </div>

      <div className="px-8 py-6 bg-white">
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            type="submit"
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-3xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  </div>
);


// /* eslint-disable react/prop-types */
// import { useState, useRef, useEffect } from "react";
// import { FiSettings, FiLogOut } from "react-icons/fi";
// import { useNavigate } from "react-router-dom";
// import profile from "../../../assets/images/profile-img.png";
// import backbutton from "../../../assets/icons/back-icon.png";

// const UserProfile = (props) => {
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const navigate = useNavigate();

//   const onSettings = () => setIsSettingsOpen(true);

//   const user = JSON.parse(localStorage.getItem("user"));

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     navigate("/login", { replace: true });
//     window.location.reload();
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative w-full p-2 mb-2 ">
//       {/* Right side: User avatar fixed */}
//       <div className="absolute right-0 top-0" ref={dropdownRef}>
//         <img
//           src={
//             user?.avatar ||
//             "https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
//           }
//           alt="User avatar"
//           className="w-10 h-10 rounded-full cursor-pointer"
//           onClick={() => setOpen(!open)}
//         />

//         {open && (
//           <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-50">
//             <div className="p-4 flex flex-col items-center border-b">
//               <img
//                 src={
//                   user?.avatar ||
//                   "https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
//                 }
//                 alt="User avatar"
//                 className="w-12 h-12 rounded-full mb-2"
//               />
//               <p className="text-sm font-semibold">
//                 {user?.name || "Loading..."}
//               </p>
//               <p className="text-xs text-gray-500">
//                 {user?.email || "Loading..."}
//               </p>
//             </div>
//             <button
//               onClick={onSettings}
//               className="flex items-center w-full px-4 py-3 hover:bg-gray-100 text-sm"
//             >
//               <FiSettings className="mr-2" /> Settings
//             </button>

//             {/* Settings Modal */}
//             {isSettingsOpen && (
//               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-11/12 max-w-md">
//                   <div className="bg-[#FCD2AA] p-6 flex flex-col items-center relative">
//                     <button
//                       onClick={() => setIsSettingsOpen(false)}
//                       className="absolute top-4 right-4 text-gray-700 text-xl hover:text-black"
//                     >
//                       ✕
//                     </button>
//                     <div className="relative">
//                       <img
//                         src={profile}
//                         alt="Profile"
//                         className="rounded-full w-20 h-20 object-cover border-2 border-white"
//                       />
//                       <span className="absolute bottom-1 right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
//                     </div>
//                     <p className="text-sm text-gray-600 mt-2">
//                       {user?.email || "Loading..."}
//                     </p>
//                     <h2 className="font-bold text-lg mt-1">Edit Profile</h2>
//                   </div>

//                   <div className="px-8 py-6 bg-white">
//                     <div className="space-y-4">
//                       <input
//                         type="text"
//                         placeholder="Name"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
//                       />
//                       <input
//                         type="password"
//                         placeholder="Current Password"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
//                       />
//                       <input
//                         type="password"
//                         placeholder="New Password"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
//                       />
//                       <input
//                         type="password"
//                         placeholder="Confirm Password"
//                         className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
//                       />
//                     </div>
//                     <button className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-3xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400">
//                       Save
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <button
//               onClick={handleLogout}
//               className="flex items-center w-full px-4 py-3 hover:bg-gray-100 text-sm"
//             >
//               <FiLogOut className="mr-2" /> Log out
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Left side: Back button and heading, padded to avoid overlap */}
//       <div className="pr-16">
//         <div className="flex items-start gap-2 flex-wrap">
//           {props.showBackButton && (
//             <button onClick={props.onBack || (() => navigate(-1))}>
//               <img className="w-6 pt-1" src={backbutton} alt="Back" />
//             </button>
//           )}
//           <h1 className="text-xl sm:text-2xl font-bold break-words">
//             {props.heading}
//           </h1>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;