import logo from '../../../assets/images/doulLogo.png';
import UserProfile from '../user-profile/UserProfile';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2 bg-white border-b border-gray-300 shadow h-16 md:h-20">
            <div className="flex items-center gap-4">
                <img src={logo} alt="SSISM Logo" className="h-12 md:h-16" />
            </div>
            <div className="relative">
                <UserProfile />
            </div>
        </header>
    );
};

export default Header;
