/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";

const Header = ({
  sidebarOpen = true,
  title,
  badge,
  showBack = false,
  onBack,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <header
      className="fixed top-0 z-40 bg-white border-b border-gray-200 transition-all duration-300"
      style={{
        left: sidebarOpen ? "256px" : "64px",
        right: 0,
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
              {title}
            </h1>

            {badge && (
              <span className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-md font-medium">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {children}
        </div>
      </div>
    </header>
  );
};

export default Header;
