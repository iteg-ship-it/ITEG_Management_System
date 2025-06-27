import { Outlet } from 'react-router-dom';
import Sidebar from './../common-components/sidebar/Sidebar';
import Header from '../common-components/sidebar/Header';
import Dashboard from './Dashboard';
const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            {/* <aside className="fixed top-16 left-0 w-60 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-md z-20"> */}
                <Sidebar >
                    <Dashboard />
                </Sidebar>
            {/* </aside> */}

            {/* Main Content */}
            <div className="flex-1  mt-16 p-4 overflow-auto">
                <Outlet /> {/* nested route yaha render hoga */}
            </div>

            {/* Header */}
            <Header />
        </div>
    );
};

export default Layout;
