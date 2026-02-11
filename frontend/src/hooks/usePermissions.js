import { useGetCurrentUserPermissionsQuery } from '../redux/api/authApi';

export const usePermissions = () => {
  const { data: permissionsData, isLoading, error } = useGetCurrentUserPermissionsQuery();
  
  const permissions = permissionsData?.permissions?.permissions || {};
  const userRole = permissionsData?.permissions?.role;
  
  const hasPermission = (page, action = 'view') => {
    // SuperAdmin always has all permissions
    if (userRole === 'superadmin') {
      return true;
    }
    return permissions[page]?.[action] || false;
  };

  const hasAnyPermission = (permissionChecks) => {
    // SuperAdmin always has all permissions
    if (userRole === 'superadmin') {
      return true;
    }
    return permissionChecks.some(({ page, action }) => hasPermission(page, action));
  };

  const hasAllPermissions = (permissionChecks) => {
    // SuperAdmin always has all permissions
    if (userRole === 'superadmin') {
      return true;
    }
    return permissionChecks.every(({ page, action }) => hasPermission(page, action));
  };

  return {
    permissions,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
    error
  };
};