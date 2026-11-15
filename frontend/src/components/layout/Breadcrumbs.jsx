import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { hasPermission, hasRole } from "../auth/permissionUtils";
import { menuConfig } from "../auth/menuConfig";

const Breadcrumbs = () => {
  const location = useLocation();
  const { user } = useAuth();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap = {
    leads: "Leads",
    dashboard: "Dashboard",
    settings: "Settings",
    reports: "Reports",
    activities: "Activities",
    contacts: "Contacts",
    about: "About",
    referrers: "Referrers",
    services: "Services",
    followups: "Follow-ups",
    "follow-ups": "Follow-ups",
    user: "User",
    organizations: "Organizations",
    billings: "Billing",
    expenses: "Expenses",
    roles: "Roles",
    users: "Users",
    "audit-logs": "Audit Logs",
    "organization-profile": "Organization Profile",
  };

  const getBreadcrumbName = (name) =>
    breadcrumbNameMap[name.toLowerCase()] ||
    name.charAt(0).toUpperCase() + name.slice(1);

  const checkAccess = (path) => {
    const configItem = menuConfig.find((item) => item.path === path);
    if (!configItem) return true;
    if (configItem.permission && !hasPermission(user, configItem.permission)) return false;
    if (configItem.role && !hasRole(user, configItem.role)) return false;
    return true;
  };

  const homeAllowed = checkAccess("/");

  return (
    <nav className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 flex-wrap print:hidden font-inter">
      {homeAllowed ? (
        <Link
          to="/"
          className="text-gray-400 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
        >
          <span>Home</span>
        </Link>
      ) : (
        <span className="text-gray-400">Home</span>
      )}

      {pathnames.map((value, index) => {
        if (value === "admin") return null;

        let to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        if (to === "/print/invoice") to = "/billings";

        const isAllowed = checkAccess(to);
        const isClickable = to !== "/print" && !isLast && isAllowed;
        const displayName = getBreadcrumbName(value);

        return (
          <React.Fragment key={to}>
            <span className="text-gray-300">/</span>
            {!isClickable ? (
              <span className="text-gray-700 font-medium">
                {displayName}
              </span>
            ) : (
              <Link
                to={to}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
