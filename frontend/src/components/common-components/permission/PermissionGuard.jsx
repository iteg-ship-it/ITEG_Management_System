import { usePermissions } from '../../hooks/usePermissions';

const PermissionGuard = ({ 
  page, 
  action = 'view', 
  children, 
  fallback = null,
  requireAll = false,
  permissions = null 
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isLoading } = usePermissions();

  if (isLoading) {
    return fallback;
  }

  let hasAccess = false;

  if (permissions && Array.isArray(permissions)) {
    // Multiple permissions check
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (page) {
    // Single permission check
    hasAccess = hasPermission(page, action);
  }

  return hasAccess ? children : fallback;
};

export default PermissionGuard;