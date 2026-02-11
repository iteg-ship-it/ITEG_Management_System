import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosInstance';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions/me');
      setPermissions(response.data.permissions?.permissions || {});
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (page, action) => {
    if (!permissions || !permissions[page]) return false;
    return permissions[page][action] === true;
  };

  const canView = (page) => hasPermission(page, 'view');
  const canEdit = (page) => hasPermission(page, 'edit');
  const canAdd = (page) => hasPermission(page, 'add');
  const canDelete = (page) => hasPermission(page, 'delete');

  return (
    <PermissionContext.Provider value={{
      permissions,
      loading,
      hasPermission,
      canView,
      canEdit,
      canAdd,
      canDelete,
      refreshPermissions: fetchPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};