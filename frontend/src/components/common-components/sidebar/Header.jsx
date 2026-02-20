/* eslint-disable react/prop-types */
import logo from '../../../assets/images/doulLogo.png';

const Header = ({ sidebarOpen = true, heading, buttons, searchBox }) => {


    return (
        <header 
            className={`fixed top-0 z-40 flex items-center justify-between px-2 sm:px-4 py-1 sm:py-2 bg-[var(--backgroundColor)] border-b border-gray-300 shadow h-14 sm:h-16 md:h-20 transition-all duration-300`}
            style={{ left: sidebarOpen ? '256px' : '48px', right: 0 }}
        >
            <div className="flex items-center gap-2 sm:gap-4">
                <img src={logo} alt="SSISM Logo" className="h-12 sm:h-16 md:h-20 lg:h-24" />
                {heading && (
                    <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
                        {heading}
                    </h1>
                )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                {searchBox}
                {buttons}
            </div>
        </header>
    );
};

export default Header;


