import { usePermissions } from '../../../contexts/PermissionContext';

// Component to conditionally render based on permissions
export const PermissionGate = ({ page, action, children, fallback = null }) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) return null;
  
  return hasPermission(page, action) ? children : fallback;
};

// Button component with permission check
export const PermissionButton = ({ page, action, children, className, onClick, ...props }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(page, action)) return null;

  return (
    <button className={className} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Page wrapper with permission check
export const PermissionPage = ({ page, children, fallback }) => {
  const { canView, loading } = usePermissions();

  if (loading) return <div>Loading...</div>;
  
  if (!canView(page)) {
    return fallback || <div className="text-center p-8">Access Denied</div>;
  }

  return children;
};