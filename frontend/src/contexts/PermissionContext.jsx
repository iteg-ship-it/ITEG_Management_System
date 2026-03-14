import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Set role-based permissions immediately
        const userRole = localStorage.getItem('role');
        if (userRole) {
            const rolePermissions = getRoleBasedPermissions(userRole);
            setPermissions(rolePermissions);
        }
        setLoading(false);
    }, []);

    const getRoleBasedPermissions = (role) => {
        const basePermissions = {
            dashboard: { view: true },
            user_management: { view: false, create: false, edit: false, delete: false },
            student_records: { view: false, create: false, edit: false, delete: false },
            task_management: { view: false, create: false, edit: false, delete: false, approve: false },
            reports: { view: false, create: false, edit: false, delete: false },
            settings: { view: false, edit: false },
            permission_management: { view: false, edit: false }
        };

        switch (role) {
            case 'superadmin':
                return {
                    dashboard: { view: true },
                    user_management: { view: true, create: true, edit: true, delete: true },
                    student_records: { view: true, create: true, edit: true, delete: true },
                    task_management: { view: true, create: true, edit: true, delete: true, approve: true },
                    reports: { view: true, create: true, edit: true, delete: true },
                    settings: { view: true, edit: true },
                    permission_management: { view: true, edit: true }
                };
            case 'admin':
                return {
                    dashboard: { view: true },
                    user_management: { view: true, create: true, edit: true, delete: false },
                    student_records: { view: true, create: true, edit: true, delete: false },
                    task_management: { view: true, create: true, edit: true, delete: false, approve: true },
                    reports: { view: true, create: true, edit: true, delete: false },
                    settings: { view: true, edit: false },
                    permission_management: { view: false, edit: false }
                };
            case 'faculty':
                return {
                    dashboard: { view: true },
                    user_management: { view: false, create: false, edit: false, delete: false },
                    student_records: { view: true, create: true, edit: true, delete: false },
                    task_management: { view: true, create: true, edit: true, delete: false, approve: false },
                    reports: { view: true, create: false, edit: false, delete: false },
                    settings: { view: false, edit: false },
                    permission_management: { view: false, edit: false }
                };
            default:
                return basePermissions;
        }
    };

    const hasPermission = (module, action) => {
        try {
            const userRole = localStorage.getItem('role');
            
            // Superadmin has all permissions
            if (userRole === 'superadmin') {
                return true;
            }
            
            return permissions[module]?.[action] || false;
        } catch (error) {
            console.error('Error checking permission:', error);
            return false;
        }
    };

    const value = {
        permissions,
        hasPermission,
        loading
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};