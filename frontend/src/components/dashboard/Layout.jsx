import Sidebar from './../common-components/sidebar/Sidebar';
import Dashboard from './Dashboard';

const Layout = () => {
    return (
        <div className="min-h-screen">
            <Sidebar>
                <Dashboard />
            </Sidebar>
        </div>
    );
};

export default Layout;