import { useAuth } from "./AuthProvider";
import { hasRole } from "./permissionUtils";
import { Navigate } from "react-router-dom";

const RoleGuard = ({
  role,
  children,
  fallback = <Navigate to="/" replace />,
}) => {
  const { user } = useAuth();

  if (hasRole(user, role)) {
    return children;
  }

  return fallback;
};

export default RoleGuard;
