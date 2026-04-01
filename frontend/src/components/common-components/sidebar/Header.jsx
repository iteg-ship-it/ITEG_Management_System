/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";
import { HiChevronRight } from "react-icons/hi";
import { useSidebar } from "../../../contexts/SidebarContext";

const Header = ({
  sidebarOpen = true,
  title,
  badge,
  children,
  breadcrumbs = [],
  bottomRow = null,
}) => {
  const navigate = useNavigate();
  const { openMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">

      {/* Top Row: Breadcrumbs + Bell */}
      <div className="flex items-center justify-between flex-wrap px-3 sm:px-4 md:px-6 min-h-9 py-1.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-1.5 flex-wrap">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <button
                onClick={() => crumb.path && navigate(crumb.path, { state: crumb.state })}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-orange-500 font-semibold cursor-default'
                    : crumb.path
                    ? 'text-gray-400 hover:text-gray-600 cursor-pointer'
                    : 'text-gray-400 cursor-default'
                }`}
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <button className="relative p-1.5 rounded-lg hover:bg-gray-200 transition">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Main Header Row — only renders when title, badge, subtitle or children are present */}
      {(title || badge || subtitle || children) && (
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-16 sm:h-18 md:h-20 border-b border-gray-200">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                {title && (
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
                    {title}
                  </h1>
                )}
                {badge && (
                  <span className="text-xs sm:text-sm bg-gray-100 text-gray-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-medium whitespace-nowrap">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition flex-shrink-0">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Row 2: children (search, filter, export) */}
        {children && (
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 flex-wrap">
            {children}
          </div>
        )}
      </div>

      {/* Desktop header */}
      <div className="hidden lg:block">
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 px-6 py-1.5 border-b border-gray-200 bg-gray-50 overflow-x-auto scrollbar-none">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => crumb.path && navigate(crumb.path, { state: crumb.state })}
                  className={`text-xs font-medium transition-colors whitespace-nowrap ${
                    index === breadcrumbs.length - 1
                      ? 'text-gray-700 font-semibold cursor-default'
                      : crumb.path
                      ? 'text-orange-500 hover:text-orange-600 cursor-pointer'
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  {crumb.label}
                </button>
                {index < breadcrumbs.length - 1 && <ChevronRight size={12} className="text-gray-400" />}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-gray-800 truncate">{title}</h1>
            {badge && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row (e.g. level tabs) */}
      {bottomRow && (
        <div className="px-3 sm:px-4 md:px-6 border-b border-gray-200 bg-white">
          {bottomRow}
        </div>
      )}

    </header>
  );
};

export default Header;
