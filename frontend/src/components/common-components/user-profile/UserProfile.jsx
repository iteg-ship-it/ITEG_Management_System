/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileImg from "../../../assets/images/profile-img.png";
import backIcon from "../../../assets/icons/back-icon.png";
import { useLogoutMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";
import SettingsModal from "./SettingModal";

const UserProfile = ({ heading, showBackButton = false, onBack }) => {
  const [open, setOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [logout] = useLogoutMutation();
  const handleLogout = async () => {
    try {
      const userId = user?.id || user?._id;
      console.log("🔑 Initiating logout for user:", userId);
      const res = await logout({ id: userId }).unwrap();
      console.log("✅ Logout success:", res);

      localStorage.clear();
      toast.success(res.message);
      navigate("/login");
    } catch (err) {
      console.error("❌ Logout failed:", err?.data || err);
      toast.error(err?.data?.message || "Logout failed");
    }
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
      <div className="absolute right-0 top-0 border-2 rounded-full" ref={dropdownRef}>
        <img
          src={user?.avatar || profileImg}
          alt="User avatar"
          className="w-12 h-12 rounded-full cursor-pointer"
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
              <FiLogOut className="mr-2" />
              Logout
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
