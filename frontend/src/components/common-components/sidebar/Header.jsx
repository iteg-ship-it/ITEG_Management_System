/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight } from "lucide-react";

const Header = ({
  title,
  badge,
  onBack,
  children,
  breadcrumbs = [],
}) => {
  const navigate = useNavigate();



  return (
    <header className="sticky top-0 z-10 bg-white">

      {/* Breadcrumbs Row */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap px-3 sm:px-4 md:px-6 min-h-9 py-1.5 border-b border-gray-200 bg-gray-50">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <button
                onClick={() => crumb.path && navigate(crumb.path, { state: crumb.state })}
                className={`text-xs sm:text-sm font-medium transition-colors ${
                  index === breadcrumbs.length - 1
                    ? 'text-gray-700 font-semibold cursor-default'
                    : crumb.path
                    ? 'text-orange-500 hover:text-orange-600 cursor-pointer'
                    : 'text-gray-400 cursor-default'
                }`}
              >
                {crumb.label}
              </button>
              {index < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-16 sm:h-18 md:h-20 border-b border-gray-200">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div className="flex flex-col gap-1 min-w-0">
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


// /* eslint-disable react/prop-types */
// import logo from '../../../assets/images/doulLogo.png';
// import OrangeButton from './OrangeButton';

// const Header = ({ sidebarOpen = true, heading, buttons, searchBox }) => {


//     return (
//         <header
//             className={`fixed top-0 z-40 flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 bg-white h-14 sm:h-16 md:h-20 transition-all duration-300`}
//             style={{ left: sidebarOpen ? '256px' : '48px', right: 0 }}
//         >
//             <div className="flex items-center gap-2 sm:gap-4">
//                 <img src={logo} alt="SSISM Logo" className="h-12 sm:h-16 md:h-20 lg:h-24" />
//                 {heading && (
//                     <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
//                         {heading}
//                     </h1>
//                 )}
//             </div>
//             <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
//                 {searchBox}
//                 {buttons}
//                 <OrangeButton
//                     buttonTitle="Add user"
//                     panelTitle="Panel"
//                     drawerContent={<div>Your content here</div>}
//                 />

//             </div>
//         </header>
//     );
// };

// export default Header;

