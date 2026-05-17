import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

const HardwareBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleBackButton = async () => {
            // Priority 1: Check for open modals/dialogs
            const openModal = document.querySelector('[role="dialog"], .modal-open, .fixed.inset-0');
            if (openModal) {
                // If we found a modal, we try to find its close button or just don't exit
                // For now, if a modal is open, we can't easily trigger the state change from here
                // But we can prevent app exit
                return;
            }

            // Priority 2: Check for root pages
            const rootPaths = ['/student-portal/dashboard', '/login', '/'];
            if (rootPaths.includes(location.pathname)) {
                CapApp.exitApp();
            } else {
                navigate(-1);
            }
        };

        const listener = CapApp.addListener('backButton', (data) => {
            handleBackButton();
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, [location, navigate]);

    return null;
};

export default HardwareBackButton;
