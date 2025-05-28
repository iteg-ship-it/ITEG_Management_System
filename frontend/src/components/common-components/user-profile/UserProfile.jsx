/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import profileImg from "../../../assets/images/profile-img.png";
import backIcon from "../../../assets/icons/back-icon.png";
import { useUpdateUserMutation } from "../../../redux/api/authApi";
import { toast } from "react-toastify";

const UserProfile = ({ heading, showBackButton = false, onBack }) => {
  const [open, setOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // const [logout, ] = useLogoutMutation();


  //   const handleLogout = async () => {
  //   try {
  //     const userId = user?._id;
  //     if (!userId) throw new Error("User ID is missing");

  //     await logout({ _id: userId }).unwrap();

  //     localStorage.clear();
  //     sessionStorage.clear();
  //     toast.success("Logged out successfully!");
  //     navigate("/login");
  //   } catch (err) {
  //     console.error("Logout failed", err);
  //     toast.error(err?.data?.message || err.message || "Logout failed");
  //   }
  // };


  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/login");
  }
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
              {/* {isLoading ? "Logging out..." : "Logout"} */}
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
// SettingsModal component
// ─────────────────────────────────────────────
const SettingsModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await updateUser({
        id: user._id,
        data: {
          name: formData.name,
          // Add more fields if needed (position, role, etc.)
        },
      }).unwrap();

      toast.success("Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify(response.user)); // update localStorage
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  return (
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
          <p className="text-sm text-gray-600 mt-2">{user?.email}</p>
          <h2 className="font-bold text-lg mt-1">Edit Profile</h2>
        </div>

        <div className="px-8 py-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {/* Optional: Add fields like position, role, etc. */}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-3xl font-medium focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};