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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-14 sm:h-16">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">

          {/* Back Button */}
          {showBack && (
            <button
              onClick={handleBack}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Title + Badge */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
              {title}
            </h1>

            {badge && (
              <span className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-medium whitespace-nowrap">
                {badge}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

          {/* Custom Children */}
          {children}

          {/* Bell Icon */}
          <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition">
            <Bell size={18} className="sm:w-5 sm:h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;
