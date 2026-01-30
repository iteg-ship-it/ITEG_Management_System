import { useState, useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileImg from "../../../assets/images/profile-img.png";
// import Loader from "../loader/Loader";
// import backIcon from "../../../assets/icons/back-icon.png";
import { useLogoutMutation } from "../../../redux/api/authApi";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../../redux/auth/authSlice";
import { toast } from "react-toastify";
import SettingsModal from "./SettingModal";

// const UserProfile = ({ heading, showBackButton = false, onBack }) => {
const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [logout] = useLogoutMutation();
  
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutConfirm(false);
      
      // Clear Redux state first
      dispatch(logoutAction());
      
      // Try to call logout API, but don't fail if it doesn't work
      try {
        const userId = user?.id || user?._id;
        if (userId) {
          await logout({ id: userId }).unwrap();
        }
      } catch (apiError) {
        console.warn("Logout API failed, but continuing with local logout:", apiError);
      }
      
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("❌ Logout failed:", err);
      // Even if logout fails, clear Redux state and redirect
      dispatch(logoutAction());
      toast.error("Logout completed");
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
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
      <div className="relative" ref={dropdownRef}>
        <img
          src={user?.avatar || profileImg}
          alt="User avatar"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer object-cover border"
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
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="flex items-center w-full px-4 py-3 hover:bg-gray-100 text-sm"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Heading & Back Button */}
      {/* <div className="pr-16">
        <div className="flex items-start gap-2 flex-wrap">
          {showBackButton && (
            <button onClick={onBack || (() => navigate(-1))}>
              <img className="w-6 pt-1" src={backIcon} alt="Back" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold break-words">{heading}</h1>
        </div>
      </div> */}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal user={user} onClose={() => setIsSettingsOpen(false)} />
      )}
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-[#FDA92D] text-md text-white px-3 py-1 rounded-md hover:bg-[#ED9A21] active:bg-[#B66816] transition relative"
              >
                {isLoggingOut ? "Logging out..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
