/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const UserProfile = (props) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const onSettings = () => {
    console.log("Opening settings...");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-start">
      <h1 className="text-2xl py-1 font-bold mb-6 text-center md:text-left">
       {props.heading}
      </h1>
      <div className="relative" ref={dropdownRef}>
        <img
          src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe" 
          alt="User avatar"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={() => setOpen(!open)}
        />

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50">
            <div className="p-4 flex flex-col items-center border-b">
              <img
                src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe"
                alt="User avatar"
                className="w-12 h-12 rounded-full mb-2"
              />
              <p className="text-sm font-semibold">Olivia Rhye</p>
              <p className="text-xs text-gray-500">olivia@untitledui.com</p>
            </div>
            <button
              onClick={onSettings}
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
    </div>
  );
};

export default UserProfile;
