import logo from '../../../assets/images/doulLogo.png';
import UserProfile from '../user-profile/UserProfile';
const Header = () => {
    return (
        <header className="flex items-center justify-between p-2 md:p-2 bg-white border-b border-gray-300 shadow z-10 w-full">
            <div className="flex items-center gap-4">
                <img src={logo} alt="SSISM Logo" className="h-16 md:h-20" />
             
            </div>
            <div className="relative">
        <UserProfile />
      </div>
        </header>
    );
};

export default Header;
