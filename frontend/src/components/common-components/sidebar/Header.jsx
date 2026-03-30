/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, ArrowLeft } from "lucide-react";

const Header = ({
  sidebarOpen = true,
  title,
  badge,
  showBack = false,
  onBack,
  children,
  breadcrumbs = [],
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-10 bg-white">
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-16 sm:h-18 md:h-20 border-b border-gray-200">

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

          {/* Title + Badge + Breadcrumbs */}
          <div className="flex flex-col gap-1 min-w-0">

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <button
                      onClick={() => crumb.path && navigate(crumb.path, { state: crumb.state })}
                      className={`text-xs sm:text-sm font-medium transition-colors ${
                        crumb.path
                          ? "text-orange-500 hover:text-orange-600 cursor-pointer"
                          : "text-gray-500 cursor-default"
                      }`}
                    >
                      {crumb.label}
                    </button>
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight size={14} className="text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
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
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {children}
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
