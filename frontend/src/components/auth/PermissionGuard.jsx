import { useAuth } from "./AuthProvider";
import { hasPermission } from "./permissionUtils";

const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { user } = useAuth();

  if (hasPermission(user, permission)) {
    return children;
  }

  return fallback;
};

export default PermissionGuard;
