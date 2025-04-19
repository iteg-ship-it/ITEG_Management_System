import { useState, useRef, useEffect } from "react";
import { FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  // const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Important!
    navigate("/login", { replace: true });
    window.location.reload(); // Optional but useful to re-evaluate auth state
  };
  const onSettings = () => {
    // Navigate to settings page or open modal
    console.log("Opening settings...");
  };
  // Close dropdown when clicking outside
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
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        className="flex justify-end cursor-pointer p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
        onClick={() => setOpen(!open)}
      >
        <FiUser size={20} />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={onSettings}
            className="flex items-center px-4 py-2 w-full hover:bg-gray-100 text-sm"
          >
            <FiSettings className="mr-2" /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 w-full hover:bg-gray-100 text-sm"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
