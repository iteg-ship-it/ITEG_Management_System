/* eslint-disable react/prop-types */
import { HiArrowNarrowLeft } from "react-icons/hi";

const PageNavbar = ({
  title,
  subtitle,
  onBack = () => window.history.back(),
  rightContent = null,
  showBackButton = true
}) => {
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
              <h1 className="text-2xl font-bold text-black">{title}</h1>
              {subtitle && <p className="text-sm text-black">{subtitle}</p>}
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