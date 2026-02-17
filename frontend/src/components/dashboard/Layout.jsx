import Sidebar from './../common-components/sidebar/Sidebar';
import Header from '../common-components/sidebar/Header';
import Dashboard from './Dashboard';

const Layout = () => {
    return (
        <div className="min-h-screen">
            <Sidebar>
                <Dashboard />
            </Sidebar>
            <Header />
        </div>
    );
};

export default Layout;