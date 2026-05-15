/* eslint-disable react/prop-types */
import { HiArrowNarrowLeft } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { HiChevronRight } from "react-icons/hi";

const PageNavbar = ({
  title,
  subtitle,
  onBack = () => window.history.back(),
  rightContent = null,
  showBackButton = true,
  breadcrumbs = []
}) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10">
      <div className="px-1 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={onBack}
                className="group flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 hover:text-gray-900"
              >
                <HiArrowNarrowLeft className="text-lg group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            {showBackButton && <div className="h-8 w-px bg-gray-300"></div>}
            <div>
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <button
                        onClick={() => crumb.path && navigate(crumb.path)}
                        className={`text-sm font-medium transition-colors ${
                          crumb.path
                            ? "text-orange-500 hover:text-orange-600 cursor-pointer"
                            : "text-gray-500 cursor-default"
                        }`}
                      >
                        {crumb.label}
                      </button>
                      {index < breadcrumbs.length - 1 && (
                        <HiChevronRight className="text-gray-400 text-sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <h1 className="text-2xl font-bold text-black">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {rightContent && (
            <div className="flex items-center gap-3">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageNavbar;