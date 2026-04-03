/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { HiChevronRight } from "react-icons/hi";
import { useSidebar } from "../../../contexts/SidebarContext";

const Header = ({
  title,
  badge,
  subtitle,
  children,
  breadcrumbs = [],
  bottomRow = null,
}) => {
  const navigate = useNavigate();
  const { openMobileSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">

      {/* Mobile top bar */}
      <div className="lg:hidden border-b border-gray-200">
        <div className="flex items-center justify-between px-3 py-2 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={openMobileSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg text-gray-600 hover:text-orange-500 transition flex-shrink-0"
            >
              <HiChevronRight size={20} />
            </button>
            <h1 className="text-sm font-semibold text-gray-800 truncate">{title}</h1>
            {badge && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
        </div>
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
                      ? "text-orange-500 cursor-default"
                      : crumb.path
                      ? "text-gray-400 hover:text-gray-600 cursor-pointer"
                      : "text-gray-400 cursor-default"
                  }`}
                >
                  {crumb.label}
                </button>
                {index < breadcrumbs.length - 1 && <ChevronRight size={12} className="text-gray-400" />}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800 truncate">{title}</h1>
                {badge && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium whitespace-nowrap flex-shrink-0">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
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
